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
      return TaskModel.findById(taskId).lean().exec();
    }

    function updateTask(taskId, body) {
      return TaskModel.findByIdAndUpdate(taskId, body, { new: true, safe: true }).lean().exec();
    }

    function sendActionMail(params) {
      return Sendgrid.send(params);
    }

    let oldTask = await getTask(req.params.id);
    let newTask = await updateTask(req.params.id, req.payload);
    await sendActionMail({
      oldTask,
      newTask,
      action: 'tarea actualizada'
    });
    return newTask;
  }

  static updateTitle(req, h) {
    return TaskModel.findByIdAndUpdate(req.params.id, {
      title: req.payload.title
    }).lean().exec();
  }

  static updateCompleted(req, h) {
    return TaskModel.findByIdAndUpdate(req.params.id, {
      completed: req.payload.completed
    }).lean().exec().then(doc => { return doc; }, Boom.badRequest);
  }

  static async updateImages(req, h) {
    let images = await Cloudy.uploadImages(req.payload);
    let oldTask = await TaskModel.findById(req.params.id).select('images').lean().exec();

    return await TaskModel.findByIdAndUpdate(req.params.id, {
      images: _.concat(oldTask.images || [], _.map(images, img => img.url))
    }).lean().exec();
  }

  static delete(req, h) {
    // return TaskModel.findByIdAndRemove(req.params.id).lean().exec();
    return TaskModel.findByIdAndUpdate(req.params.id, {
      enable: false
    }).lean().exec();
  }
};