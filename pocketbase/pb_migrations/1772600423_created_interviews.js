/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "8sck2vv8zcp5qna",
    "created": "2026-03-04 05:00:23.511Z",
    "updated": "2026-03-04 05:00:23.511Z",
    "name": "interviews",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "ppexridx",
        "name": "application",
        "type": "relation",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "collectionId": "aiaddmisye1azh8",
          "cascadeDelete": true,
          "minSelect": null,
          "maxSelect": 1,
          "displayFields": null
        }
      },
      {
        "system": false,
        "id": "2i5kcfue",
        "name": "round",
        "type": "select",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "maxSelect": 1,
          "values": [
            "HR",
            "Technical-1",
            "Technical-2",
            "System-Design",
            "Bar-Raiser",
            "Final"
          ]
        }
      },
      {
        "system": false,
        "id": "sswszldb",
        "name": "scheduled_date",
        "type": "date",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": "",
          "max": ""
        }
      },
      {
        "system": false,
        "id": "t3pbioqw",
        "name": "status",
        "type": "select",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "maxSelect": 1,
          "values": [
            "scheduled",
            "completed",
            "cancelled"
          ]
        }
      },
      {
        "system": false,
        "id": "mnopaghj",
        "name": "interviewer_name",
        "type": "text",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "pattern": ""
        }
      },
      {
        "system": false,
        "id": "zpmdd6au",
        "name": "feedback",
        "type": "text",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "pattern": ""
        }
      },
      {
        "system": false,
        "id": "d1umaywa",
        "name": "questions",
        "type": "json",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "maxSize": 2000000
        }
      }
    ],
    "indexes": [],
    "listRule": "",
    "viewRule": "",
    "createRule": "",
    "updateRule": "",
    "deleteRule": "",
    "options": {}
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("8sck2vv8zcp5qna");

  return dao.deleteCollection(collection);
})
