import { createLog } from 'lib/actions/log/createLog'

type Picture = { objId: string; url: string }
type Video = { objId: string; video: { url: string; urlThumbnail: string; id: string } }

export const getPicturesAndVideos = async (response: any) => {
  if (!Array.isArray(response?.data)) {
    await createLog('error', 'No response data from Rescue Groups', {
      data: response?.data ?? null
    })
    return
  }

  const pictures: Picture[] = []
  const videos: Video[] = []

  for (const item of response.data) {
    item.attributes.photos = []
    item.attributes.videos = []
  }

  const pictureUrls: string[] =
    response.included
      ?.filter((item: any) => item.type === 'pictures')
      ?.map((item: any) => item.attributes?.original?.url)
      ?.filter(Boolean) ?? []

  const videoUrls: { url: string; urlThumbnail: string; id: string }[] =
    response.included
      ?.filter((item: any) => item.type === 'videourls')
      ?.map((item: any) => ({
        url: item.attributes?.url,
        urlThumbnail: item.attributes?.urlThumbnail,
        id: item.id
      }))
      ?.filter((v: any) => v.url && v.id) ?? []

  for (const item of response.data) {
    for (const url of pictureUrls) {
      if (url.includes(item.id)) {
        pictures.push({ objId: item.id, url })
      }
    }

    for (const video of videoUrls) {
      if (item?.relationships?.videourls?.data?.[0]?.id === video.id) {
        videos.push({ objId: item.id, video })
      }
    }
  }

  for (const item of response.data) {
    item.attributes.photos = pictures.filter((p) => p.objId === item.id).map((p) => p.url)

    item.attributes.videos = videos.filter((v) => v.objId === item.id).map((v) => v.video)
  }

  return response.data
}
