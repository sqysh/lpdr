import { createLog } from 'lib/actions/log/createLog'

type Video = { url: string; urlThumbnail: string; id: string }

type Related = { id: string }

type Included = {
  id: string
  type: string
  attributes?: { url?: string; urlThumbnail?: string; original?: { url?: string } }
}

type Animal = {
  id: string
  attributes: Record<string, unknown> & { photos?: string[]; videos?: Video[] }
  relationships?: Record<string, { data?: Related[] }>
}

const idsFor = (animal: Animal, relationship: string) => new Set((animal.relationships?.[relationship]?.data ?? []).map((r) => r.id))

/**
 * RescueGroups returns the animals in `data` and their media in `included`, linked by
 * relationships. This folds the media onto each animal so the rest of the app never has to know
 * that. Mutates and returns the animals, which is what the callers expect.
 *
 * `data` is an array on a search and a single object on a lookup by id, so both are handled:
 * the detail endpoint was previously falling through to the error log every time.
 */
export const getPicturesAndVideos = async (response: {
  data?: Animal | Animal[]
  included?: Included[]
}): Promise<Animal[] | undefined> => {
  if (!response?.data) {
    await createLog('warn', 'No response data from Rescue Groups', { data: response?.data ?? null })
    return
  }

  const animals = Array.isArray(response.data) ? response.data : [response.data]
  const included = response.included ?? []

  const picturesById = included.reduce<Map<string, string>>((acc, i) => {
    const url = i.attributes?.original?.url
    if (i.type === 'pictures' && url) acc.set(i.id, url)
    return acc
  }, new Map())

  const videosById = included.reduce<Map<string, Video>>((acc, i) => {
    const url = i.attributes?.url
    if (i.type === 'videourls' && url) acc.set(i.id, { url, urlThumbnail: i.attributes?.urlThumbnail ?? '', id: i.id })
    return acc
  }, new Map())

  for (const animal of animals) {
    const pictureIds = idsFor(animal, 'pictures')
    const videoIds = idsFor(animal, 'videourls')

    // Matched by relationship rather than by looking for the animal's id inside the url, which
    // matched the wrong dog whenever one id was a substring of another.
    animal.attributes.photos = [...pictureIds].map((id) => picturesById.get(id)).filter((url): url is string => !!url)

    animal.attributes.videos = [...videoIds].map((id) => videosById.get(id)).filter((v): v is Video => !!v)
  }

  return animals
}
