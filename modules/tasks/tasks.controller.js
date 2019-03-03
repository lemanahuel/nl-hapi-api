const _ = require('lodash');
const async = require('async');
const Boom = require('boom');
const Cloudy = require('../../integrations/cloudinary');
const Sendgrid = require('../../integrations/sendgrid');
const TaskModel = require('./tasks.model');

module.exports = class Tasks {
  static create(req, h) {
    return TaskModel.create(req.payload).then(doc => {
      return doc;
    }, Boom.badRequest);
  }

  static list(req, h) {
    let q = req.query;
    let findParams = { enable: true };
    let queryParams = {};

    if (q.sort) {
      queryParams.sort = q.sort;
    }
    if (q.filter) {
      findParams[_.replace(q.filter, '-', '')] = _.indexOf(q.filter, '-') > -1 ? false : true;
    }

    return TaskModel.find(findParams, null, queryParams).lean().exec().then(docs => {
      return docs;
    }, Boom.badRequest);
  }

  static read(req, h) {
    return TaskModel.findById(req.params.id).lean().exec().then(doc => {
      return doc;
    }, Boom.badRequest);
  }

  static async update(req, h) {
    function getTask(taskId) {
      return new Promise((resolve, reject) => {
        return TaskModel.findById(taskId).lean().exec().then(resolve, reject);
      });
    }

    function updateTask(taskId, body) {
      return new Promise((resolve, reject) => {
        return TaskModel.findByIdAndUpdate(taskId, body).lean().exec().then(resolve, reject);
      });
    }

    function sendActionMail(params) {
      return new Promise((resolve, reject) => {
        return Sendgrid.send(params).then(resolve, reject);
      });
    }

    return await getTask(req.params.id).then(oldTask => {
      console.log(req.params.id, req.payload);
      return updateTask(req.params.id, req.payload).then(newTask => {
        console.log(111)
        return sendActionMail({
          oldTask,
          newTask,
          action: 'tarea actualizada'
        }).then(() => {
          console.log(222);
          return h.response(newTask);
        }, Boom.badRequest);
      }, Boom.badRequest);
    }, Boom.badRequest);
  }

  static updateTitle(req, h) {
    // return TaskModel.findByIdAndUpdate(req.params.id, {
    //   title: req.payload.title
    // }).lean().exec().then(doc => { return doc; }, Boom.badRequest);

    let taskDoc = null;
    async.parallel([pCb => {
      TaskModel.findById(req.params.id).exec((err, doc) => {
        taskDoc = doc;
        pCb(err);
      });
    }], err => {
      taskDoc.title = req.payload.title;
      taskDoc.save().then(doc => {
        return doc;
      }, Boom.badRequest);
    });
  }

  static updateCompleted(req, h) {
    return TaskModel.findByIdAndUpdate(req.params.id, {
      completed: req.payload.completed
    }).lean().exec().then(doc => { return doc; }, Boom.badRequest);
  }

  static async updateImages(req, h) {
    function uploadImages(files) {
      return new Promise((resolve, reject) => {
        return Cloudy.uploadImages(files).then(resolve, reject);
      });
    }

    function getTaskImages(taskId) {
      return new Promise((resolve, reject) => {
        return TaskModel.findById(taskId).select('images').lean().exec().then(resolve, reject);
      });
    }

    function updateImages(taskId, docImages, images) {
      return new Promise((resolve, reject) => {
        return TaskModel.findByIdAndUpdate(taskId, {
          images: _.concat(docImages || [], _.map(images, img => img.url))
        }).lean().exec().then(resolve, reject);
      });
    }

    return await Promise.all([getTaskImages(req.params.id), uploadImages(req.payload.files)]).then(values => {
      return updateImages(req.params.id, values[0].images, values[1]).then(doc => { return doc; }, Boom.badRequest);
    }, Boom.badRequest);
  }

  static delete(req, h) {
    // return TaskModel.findByIdAndRemove(req.params.id).lean().exec().then(doc => { return doc; }, Boom.badRequest);
    return TaskModel.findByIdAndUpdate(req.params.id, {
      enable: false
    }).lean().exec().then(doc => { return doc; }, Boom.badRequest);
  }
};