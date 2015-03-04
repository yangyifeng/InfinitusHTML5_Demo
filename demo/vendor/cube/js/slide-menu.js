define( ['underscore', "pageslide"], function (_, $) {
	 var slideMenu = function(selector, config){
		 this.config = {
			 direction: "left"
		 }
		 this.config = $.extend(this.config, config);
		 $(selector).pageslide(this.config);
	 };
	 return slideMenu;
     
});

