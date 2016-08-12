export default {
	url : {
        type     : String,
        required : true
    },
    group : {
        type     : String,
        required : true,
        default  : 'testGroup' 
    },
    deviceType : {
        type     : Number,
        required : true
    },
    connectivity : {
        type     : String,
        required : true
    },
	plugin: { 
		type : [String], 
		required : true
	}
}
