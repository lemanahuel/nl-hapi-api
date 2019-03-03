const TasksController = require('./tasks.controller');
const middlewares = require('../../middlewares');

module.exports = server => {
  server.route({
    method: 'GET',
    path: '/tasks',
    handler: TasksController.list,
  });
  server.route({
    method: 'POST',
    path: '/tasks',
    config: {
      pre: [
        {
          method: middlewares.isValidDomain,
          assign: 'isValidDomain'
        }
      ],
      handler: TasksController.create
    }
  });
  server.route({
    method: 'GET',
    path: '/tasks/{id}',
    handler: TasksController.read
  });
  server.route({
    method: 'PUT',
    path: '/tasks/{id}',
    config: {
      pre: [
        {
          method: middlewares.isValidDomain,
          assign: 'isValidDomain'
        }
      ],
      handler: TasksController.update,
    }
  });
  server.route({
    method: 'DELETE',
    path: '/tasks/{id}',
    config: {
      pre: [
        {
          method: middlewares.isValidDomain,
          assign: 'isValidDomain'
        }
      ],
      handler: TasksController.delete,
    }
  });
  server.route({
    method: 'PUT',
    path: '/tasks/{id}/title',
    config: {
      pre: [
        {
          method: middlewares.isValidDomain,
          assign: 'isValidDomain'
        }
      ],
      handler: TasksController.updateTitle,
    }
  });
  server.route({
    method: 'PUT',
    path: '/tasks/{id}/completed',
    config: {
      pre: [
        {
          method: middlewares.isValidDomain,
          assign: 'isValidDomain'
        }
      ],
      handler: TasksController.updateCompleted,
    }
  });
  server.route({
    method: 'PUT',
    path: '/tasks/{id}/images',
    config: {
      pre: [
        {
          method: middlewares.isValidDomain,
          assign: 'isValidDomain'
        }
      ],
      handler: TasksController.updateImages,
    }
  });
};


