// Imports the Google Cloud client library
const {PubSub} = require('@google-cloud/pubsub');

const config = {
    projectId: 'mediaone-thp',// Your Google Cloud Platform project ID
    topicName: 'projects/mediaone-thp/topics/stagging-common-log', // Name for the new topic to create
    subscriptionName: "projects/mediaone-thp/subscriptions/thp-client"
}

const err = {
    pubsub_not_found: "pubsub_not_found"
}

function connect(projectId) {
    const pubsub = new PubSub({projectId})
    return pubsub
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
    const ps = connect(config.projectId)
    let err = onStreamMessage(ps, config.subscriptionName,  function({message, ack}) {
        console.log(message.id, message.data.toString())
        // slow write db tai day
        ack()
    })
    if(!err) {
        console.log('[err]: ', err)
    }
}

main()