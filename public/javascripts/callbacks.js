
var probe_list;
var active_probe;

function explore(settings,level,root){

	$.each(settings,function(key,val){

		var field = key;

		if(root) field = root + ' ' + field;

		if(typeof val === 'object'){
			//create new container within

			explore(val,level+1,field);

		}else{

			var label;
			var label2 = '';

			if(level==1){
				label = val;	

				$('#settings_container').append(
					$(document.createElement("input")).attr("type","hidden").attr("name",field).attr("value",val)
				)

			} 
			else{
				if(val){
					//console.log(key);
					label = $(document.createElement("input")).attr("type","checkbox").attr("name",field).attr("value",val).prop('checked', true).on("change",function(){
						update(field,$(this).is(":checked"));
					});
				}else{
					label = $(document.createElement("input")).attr("type","checkbox").attr("name",field).attr("value",val).on("change",function(){
						update(field,$(this).is(":checked"));
					});
				}
				label2 = "ENABLED/DISABLED";
			} 

			$('#settings_container').append(
				$(document.createElement('p')).addClass("level_"+level).append(key,"..............",label,label2)
				//$(document.createElement("input")).attr("type","checkbox").attr("value",val).prop('checked', true)
			);

		}
	});


}

function update(field,val){
	var probe = $('#settings_container').attr("value");

	$.post('/settings/update',
		{probe : probe, field : field, value : val},
		function(req,res){
			console.log("done!");
	});

	//console.log(probe + field + val);
}