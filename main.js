// Imports the Google Cloud client library
const {PubSub} = require('@google-cloud/pubsub')
const fs = require('fs')
// const config = {
//     projectId: 'mediaone-thp',// Your Google Cloud Platform project ID
//     subscriptionName: "projects/mediaone-thp/subscriptions/thp-client"
// }

const err = {
    pubsub_not_found: "pubsub_not_found"
}

function connect(projectId) {
    const pubsub = new PubSub({projectId})
    return pubsub
}

function loadJsonConfig(path) {
    let filedata = fs.readFileSync(path, 'utf8')
    return JSON.parse(filedata)
}

// @cb = {}
function onStreamMessage(psClient, subscriptionName, cb) {
    if(!psClient) {
        return new Error(err.pubsub_not_found)
    }
    const subscription = psClient.subscription(subscriptionName)

    const messageHandler = function(message) {
        const payload = {
            message: message,
            ack: function() {
                message.ack()
            }
        }
        cb(payload)
    }

    subscription.on('message', messageHandler)
    return null
}

function main() {
    // make client
    let config = loadJsonConfig("config.json")
    console.log(config)
    const ps = connect(config.projectId)
    for (let subscriptionName of config.subscriptionNames) {
        console.log(subscriptionName)
        let err = onStreamMessage(ps, subscriptionName,  function({message, ack}) {
            console.log(subscriptionName,":", message.id, message.data.toString() + "\n")
            // slow write db tai day
            ack()
        })
        console.log("listen ", subscriptionName)
        if(err) {
            console.log('[err]: ', err)
        }
    }


}

main()