import pb from './pb'

const COLLECTION = 'interviews'

export const getAll = () =>
  pb.collection(COLLECTION).getFullList({
    sort: '-scheduled_date',
    expand: 'application',
  })

export const getByApplication = (applicationId) =>
  pb.collection(COLLECTION).getFullList({
    sort: 'scheduled_date',
    filter: `application = "${applicationId}"`,
  })

export const create = (data) =>
  pb.collection(COLLECTION).create(data)

export const update = (id, data) =>
  pb.collection(COLLECTION).update(id, data)

export const remove = (id) =>
  pb.collection(COLLECTION).delete(id)
