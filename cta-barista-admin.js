/*
	Plugin Name: CTA Barista
	Description: A kick-ass Call-To-Action bar, done the right way!
	Version: 1.0
	Author: GRAFIK
	Author URI: http://www.grafik.com/

	File: ./cta-barista-admin.js
*/
if(typeof jQuery == "undefined") {

	console.log("CTA Barista requires jQuery, quitting!");

} else {

	(function($) {

		// Is CTABaristaJSON Defined?
		if( typeof CTABaristaJSON == "undefined" ) {
			console.log("CTA Barista requires a JSON string to be loaded into the CTABaristaJSON variable before execution, quitting!");
			return false;
		}

		function createMessage(obj, MessageText, ButtonText, DestinationURL, URLTarget, Disabled, Order) {

			var newKey = new Date().getTime();
			var newRow = $("<tr/>").appendTo(obj);

			MessageText = MessageText || '';
			ButtonText = ButtonText || '';
			DestinationURL = DestinationURL || '';
			URLTarget = URLTarget || '_self';
			Disabled = parseInt(Disabled || 0);
			Order = parseInt(Order || 0);

			var newCell = $("<td/>").appendTo(newRow);
			$("<input/>").appendTo(newCell).attr("type", "text").attr("name", "Message["+newKey+"][MessageText]").val(MessageText.replace(/\\/g, ''));

			var newCell = $("<td/>").appendTo(newRow);
			$("<input/>").appendTo(newCell).attr("type", "text").attr("name", "Message["+newKey+"][ButtonText]").val(ButtonText.replace(/\\/g, ''));

			var newCell = $("<td/>").appendTo(newRow);
			$("<input/>").appendTo(newCell).attr("type", "text").attr("name", "Message["+newKey+"][DestinationURL]").val(DestinationURL.replace(/\\/g, ''));

			var newCell = $("<td/>").appendTo(newRow);
			$("<input/>").appendTo(newCell).attr("type", "text").attr("name", "Message["+newKey+"][URLTarget]").val(URLTarget.replace(/\\/g, ''));

			var newCell = $("<td/>").appendTo(newRow);
			$("<input/>").appendTo(newCell).attr("type", "checkbox").attr("name", "Message["+newKey+"][Disabled]").prop("checked", Disabled == 1);

			var newCell = $("<td/>").appendTo(newRow);
			$("<input/>").appendTo(newCell).attr("type", "text").attr("name", "Message["+newKey+"][Order]").val(Order);

			var newCell = $("<td/>").appendTo(newRow);
			$("<button/>").appendTo(newCell).attr("type", "button").addClass("cta-barista-button").addClass("cta-barista-options-messages-remove").html("Remove");

		}

		$(document).on("ready", function() {

			var El_TBody = $("#cta-barista-options-messages tbody");

			// Remove Buttons...
			$("body").on("click", ".cta-barista-options-messages-remove", function(){
				$(this).parents("tr").get(0).remove();
			});

			// Create New Button...
			var Button_CreateMessage = $("#cta-barista-options-messages-create").on("click", function() {
				createMessage(El_TBody);
			});

			// Prepopulate fields...
			$('select[name="AutoRotation"]').val(CTABaristaJSON.AutoRotation);
			$('select[name="BarVisibility"]').val(CTABaristaJSON.BarVisibility);
			$('select[name="CollapseMode"]').val(CTABaristaJSON.CollapseMode);
			$('select[name="DomRelation"]').val(CTABaristaJSON.DomRelation);
			$('input[name="OffsetElement"]').val(CTABaristaJSON.OffsetElement);
			$('select[name="OffsetMethod"]').val(CTABaristaJSON.OffsetMethod);
			$('input[name="TargetElement"]').val(CTABaristaJSON.TargetElement);

			// Prefill messages...
			var ClearTBody = true;
			for(i in CTABaristaJSON.Messages) {
				if(ClearTBody) {
					ClearTBody = false;
					El_TBody.empty();
				}
				createMessage(
					El_TBody,
					CTABaristaJSON.Messages[i].MessageText,
					CTABaristaJSON.Messages[i].ButtonText,
					CTABaristaJSON.Messages[i].DestinationURL,
					CTABaristaJSON.Messages[i].URLTarget,
					CTABaristaJSON.Messages[i].Disabled,
					CTABaristaJSON.Messages[i].Order
				);
			}

		});

	})(jQuery);

}