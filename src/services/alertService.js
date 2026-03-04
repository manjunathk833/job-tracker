import pb from './pb'

export const alertSvc = {
  getAll: () => pb.collection('alerts').getFullList({ sort: '-created' }),
  create: (data) => pb.collection('alerts').create(data),
  update: (id, data) => pb.collection('alerts').update(id, data),
  delete: (id) => pb.collection('alerts').delete(id),
}

export const listingsSvc = {
  getAll: () =>
    pb.collection('job_listings').getFullList({
      sort: '-published_date',
      expand: 'alert',
    }),
  markSaved: (id) => pb.collection('job_listings').update(id, { saved: true }),
}
