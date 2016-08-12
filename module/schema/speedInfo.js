export default {
    uuid : {
        type     : String,
        required : true
    },
    type : {
        type     : String,
        required : true
    },
    source : {
        type     : String,
        required : true
    },
    url : {
        type     : String,
        required : true
    },
    timestamp: { 
        type : Date, 
        default: Date.now 
    }
}
