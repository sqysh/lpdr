import { initializeApp } from 'firebase/app'
import { getStorage } from 'firebase/storage'

export const firebaseApiKey = 'AIzaSyBDhJ4lexSGP1Caj7uw3yDPrxUR-R7sw9A'
export const firebaseStorageBucket = 'little-paws-dachshund-re-a1632.appspot.com'
export const firebaseProjectId = 'little-paws-dachshund-re-a1632'

const firebaseConfig = {
  apiKey: firebaseApiKey,
  authDomain: 'little-paws-dachshund-re-a1632.firebaseapp.com',
  projectId: firebaseProjectId,
  storageBucket: firebaseStorageBucket,
  messagingSenderId: '617318842008',
  appId: '1:617318842008:web:f651769b81d54f6b3e5aed',
  measurementId: 'G-2S8YWJRZC4'
}

const app = initializeApp(firebaseConfig)

const storage = getStorage(app)

export { storage }
