import pb from './pb'

const COLLECTION = 'applications'

export const getAll = () =>
  pb.collection(COLLECTION).getFullList({ sort: '-created' })

export const create = (data) =>
  pb.collection(COLLECTION).create(data)

export const update = (id, data) =>
  pb.collection(COLLECTION).update(id, data)

export const remove = (id) =>
  pb.collection(COLLECTION).delete(id)
