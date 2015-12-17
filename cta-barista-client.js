/*
	Plugin Name: CTA Barista
	Description: A kick-ass Call-To-Action bar, done the right way!
	Version: 1.0
	Author: GRAFIK
	Author URI: http://www.grafik.com/

	File: ./cta-barista-client.js
*/
var docCookies = {
	getItem: function(sKey) {
		if(!sKey) {
			return null;
		}
		return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
	},
	setItem: function(sKey, sValue, vEnd, sPath, sDomain, bSecure) {
		if(!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) {
			return false;
		}
		var sExpires = "";
		if(vEnd) {
			switch(vEnd.constructor) {
				case Number:
					sExpires = vEnd === Infinity ? "; expires=Fri, 31 Dec 9999 23:59:59 GMT" : "; max-age=" + vEnd;
					break;
				case String:
					sExpires = "; expires=" + vEnd;
					break;
				case Date:
					sExpires = "; expires=" + vEnd.toUTCString();
					break;
			}
		}
		document.cookie = encodeURIComponent(sKey) + "=" + encodeURIComponent(sValue) + sExpires + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "") + (bSecure ? "; secure" : "");
		return true;
	},
	removeItem: function(sKey, sPath, sDomain) {
		if(!this.hasItem(sKey)) {
			return false;
		}
		document.cookie = encodeURIComponent(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "");
		return true;
	},
	hasItem: function (sKey) {
		if (!sKey) {
			return false;
		}
		return (new RegExp("(?:^|;\\s*)" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
	},
	keys: function () {
		var aKeys = document.cookie.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, "").split(/\s*(?:\=[^;]*)?;\s*/);
		for (var nLen = aKeys.length, nIdx = 0; nIdx < nLen; nIdx++) {
			aKeys[nIdx] = decodeURIComponent(aKeys[nIdx]);
		}
		return aKeys;
	}
};
if(typeof jQuery == "undefined") {
	console.log("CTA Barista requires jQuery, quitting!");
} else {
	(function($) {
		if( typeof CTABaristaJSON == "undefined" ) {
			console.log("CTA Barista requires a JSON string to be loaded into the CTABaristaJSON variable before execution, quitting!");
			return false;
		}
		var AutoRotation = CTABaristaJSON.AutoRotation;
		var AutoTimeout;
		function toggleCollapse(obj) {
			obj.toggleClass("hide");
			adjustOffset(obj, true);
		}
		function adjustOffset(obj, animated) {
			var RootInterior = obj.find(".CTA-Barista-RootInterior");
			var OffsetProperty = CTABaristaJSON.OffsetMethod == "1" ? "margin-top" : "padding-top";
			var AnimationStyle = {
				duration : 500,
				easing : "swing",
				queue : false,
				progress : function() {
					if(CTABaristaJSON.OffsetMethod == 0 || CTABaristaJSON.OffsetElement.length < 1) return;
					var OffsetDistance = parseInt(RootInterior.outerHeight()) + parseInt(RootInterior.css("margin-top"));
					$(CTABaristaJSON.OffsetElement).css(OffsetProperty, OffsetDistance);
				}
			};
			if(obj.hasClass("hide")) {
				clearTimeout(AutoTimeout);
				if(animated) {
					docCookies.setItem("cta-barista-collapse", "1", (CTABaristaJSON.CollapseMode == "1" ? "" : "Infinity"), "/");
					RootInterior.animate({ "margin-top" : -RootInterior.outerHeight() }, AnimationStyle);
				} else {
					RootInterior.css({ "margin-top" : -RootInterior.outerHeight() });
					$(CTABaristaJSON.OffsetElement).css(OffsetProperty, 0);
				}
			} else {
				AnimationStyle.done = function() {
					rotateMessages(obj.find(".CTA-Barista-Messages"), 0);
				};
				if(animated) {
					docCookies.removeItem("cta-barista-collapse");
					RootInterior.animate({ "margin-top" : 0 }, AnimationStyle);
				} else {
					RootInterior.css({ "margin-top" : 0 });
					$(CTABaristaJSON.OffsetElement).css(OffsetProperty, RootInterior.outerHeight());
				}
			}
		}
		function rotateMessages(obj, offset) {
			var Entries = obj.find(".CTA-Barista-Messages-Entry");
			var VisibleIndex = Entries.siblings(".show").index();
			if(VisibleIndex < 0) {
				VisibleIndex = 0;
			}
			var OffsetIndex = VisibleIndex + parseInt(offset);
			if(OffsetIndex < 0) OffsetIndex = Entries.length - 1;
			if(OffsetIndex >= Entries.length) OffsetIndex = 0;
			if(Entries.length > 1) {
				obj.fadeTo("500", "0",function() {
					Entries.removeClass("show").hide();
					$(Entries.get(OffsetIndex)).addClass("show").show();
					obj.fadeTo("500", "1.0", function() {
						clearTimeout(AutoTimeout);
						if(AutoRotation != "0") {
							var RepeatReadCount = 3;
							var WordsPerSecond = (AutoRotation == 1 ? 120 : 400) / 60;
							var WordCount = $(Entries.get(OffsetIndex)).find(".CTA-Barista-Messages-Entry-Text").html().split(" ").length;
							var MillisecondsDelayed = (WordCount / WordsPerSecond) * RepeatReadCount * 1000;
							AutoTimeout = setTimeout(rotateMessages, MillisecondsDelayed, obj, 1);
						}
					});
					adjustOffset($(obj.parents(".CTA-Barista-Root").get(0)), false);
				});
			} else {
				$(Entries.get(OffsetIndex)).addClass("show").show();
				obj.fadeTo("500", "1.0");
				adjustOffset($(obj.parents(".CTA-Barista-Root").get(0)), false);
			}
		}
		$(document).on("ready", function() {
			var TargetElement = $(CTABaristaJSON.TargetElement);
			if(TargetElement.length < 1) {
				console.log("CTA Barista could not attach to a parent element, quitting!");
				return false;
			}
			var CTABaristaRoot = $("<div/>").addClass("CTA-Barista-Root");
			switch(CTABaristaJSON.DomRelation) {
				case 0: CTABaristaRoot.appendTo(TargetElement); break;
				case 1: CTABaristaRoot.prependTo(TargetElement); break;
				case 2: CTABaristaRoot.insertAfter(TargetElement); break;
				case 3: CTABaristaRoot.insertBefore(TargetElement); break;
			}
			if(CTABaristaJSON.CollapseMode != "0") {
				var CTABaristaCollapse = $("<div/>").appendTo(CTABaristaRoot).addClass("CTA-Barista-Collapse");
				var CTABaristaCollapseToggle = $("<span/>").appendTo(CTABaristaCollapse).addClass("CTA-Barista-Collapse-Toggle").on("click", function() {
					toggleCollapse( CTABaristaRoot );
				});
				if(docCookies.getItem("cta-barista-collapse", "/") == "1") {
					CTABaristaRoot.addClass("hide");
				}
			}
			var CTABaristaRootInterior = $("<div/>").appendTo(CTABaristaRoot).addClass("CTA-Barista-RootInterior");
			var CTABaristaPrev = $("<span/>").appendTo(CTABaristaRootInterior).addClass("CTA-Barista-Prev").on("click", function() {
				rotateMessages(CTABaristaMessages, -1);
			});
			var CTABaristaNext = $("<span/>").appendTo(CTABaristaRootInterior).addClass("CTA-Barista-Next").on("click", function() {
				rotateMessages(CTABaristaMessages, 1);
			});
			var CTABaristaMessages = $("<div/>").appendTo(CTABaristaRootInterior).addClass("CTA-Barista-Messages");
			for(i in CTABaristaJSON.Messages) {
				var CTABaristaMessagesEntry = $("<div/>").appendTo(CTABaristaMessages).attr("data-order", CTABaristaJSON.Messages[i].Order).addClass("CTA-Barista-Messages-Entry");
				$("<a/>").appendTo(CTABaristaMessagesEntry).attr("href", CTABaristaJSON.Messages[i].DestinationURL).attr("target", CTABaristaJSON.Messages[i].URLTarget).addClass("CTA-Barista-Messages-Entry-Text").html(CTABaristaJSON.Messages[i].MessageText.replace(/\\/g,''));
				$("<a/>").appendTo(CTABaristaMessagesEntry).attr("href", CTABaristaJSON.Messages[i].DestinationURL).attr("target", CTABaristaJSON.Messages[i].URLTarget).addClass("CTA-Barista-Messages-Entry-Button").html(CTABaristaJSON.Messages[i].ButtonText.replace(/\\/g,''));
			}
			$(".CTA-Barista-Messages-Entry").sort(function(a, b) {
				return $(a).data("order") - $(b).data("order");
			}).appendTo(CTABaristaMessages);
			CTABaristaMessages.hide();
			rotateMessages(CTABaristaMessages, 0);
			$(window).on("resize", function() {
				adjustOffset(CTABaristaRoot, false);
			});
		});
	})(jQuery);
}