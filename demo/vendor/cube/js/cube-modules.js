/*
String.prototype.endWith = String.prototype.endWith || function(s){
  if(s==null||s==""||this.length==0||s.length>this.length)
     return false;
  if(this.substring(this.length-s.length)==s)
     return true;
  else
     return false;
  return true;
 };
 */

define(['zepto', 'cube/store', 'underscore', 'cube/slide-menu', "cube/cube-page", 'iscroll.lite', 'backbone'], function($, Store, _ , Menu, Page, iScroll, Backbone){

	var Module  = Backbone.View.extend({
		config : {},
		menuBtn : null,
		render : function() {
			_.map($("module"), function(tag){
				var style="width: 45px;" 
					  + "height: 30px;"
					  + "position: absolute;"
					  + "overflow: visible;"
					  + "display: inline-block;"
					  + "float: right;"
					  + "right : 5px;"
					  + "top : 7px;";

				var menuBtn = $("<a class='menu-open' style='"+style+"' href='#nav_relates'></a>");
				var atts = tag.attributes, len = atts.length, att, i = 0 ;
				for(; i < len ; i++){
					att = atts[i];
					if(att.specified){
						menuBtn.attr(att.name, att.value);
					}
				}
				$(tag).replaceWith(menuBtn);
				//return new Module({menuBtn : menuBtn});
			});
		},
		initialize: function(){
			this.render();
			if (arguments && arguments.length > 0) {
                var config = arguments[0];
                this.config = _.extend(this.config, config);
            }
			if(this.config.menuBtn) {
				this.menuBtn = this.config.menuBtn;
				delete this.config.menuBtn;
			}
			this.init();
		},

		getUrlVars : function(){
			var vars = [], hash;
			var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
			for(var i = 0; i < hashes.length; i++)
			{
			  hash = hashes[i].split('=');
			  vars.push(hash[0]);
			  vars[hash[0]] = hash[1];
			}
			return vars;
		},

		loadMule : function(mpackage) {
			var url = "CubeModule.json";
			if(mpackage) {
				url = "../" + mpackage + "/" +url;
			}
			var moduleCfg;
			$.ajax({
						async:false,
						//block: true,
						timeout: 20 * 1000,
						traditional:true,
						url: url,
						//type: 'GET',
						//data: me.requestParams,
						dataType : "json",
						success: function(data, textStatus, jqXHR){
							moduleCfg = data;
							Store.saveObject("_module_"+mpackage, moduleCfg);
							/*
							if(reqPamas["depResult"] == "true") {
								alert(window.location.href);
							}
							else if(window.location.href.endWith("index.html") && data.dep) {
								window.location.href="../"+data.dep+"/index.html?isDep=true&depFrom="+data["package"]+"&depTo="+data.dep;
								Store.saveObject('modules_dep', module);
								
								//var obj = {depFrom : data["package"], depTo : data.dep};
								//window.depInDep = obj;
								//alert(window.depInDep);
								//Store.saveObject('modules_dep', obj);
							}*/
							//alert(data.name);
						},
						error: function(e, xhr, type){
							console.error('模块'+mpackage+'加载失败：' + e + "/" + type + "/" + xhr);
						}
				});
				return moduleCfg;
		},

		getPackage : function() {
			var mpackage;
			var curl = window.location.href;
			//var pageIndex = curl.indexOf("/index.html");
			var pageIndex = curl.lastIndexOf("/");
			if(pageIndex > -1) {
				mpackage = curl.substring(0, pageIndex);
				var spindex = mpackage.lastIndexOf("/");
				if(spindex > -1) {
					mpackage = mpackage.substring(spindex + 1, mpackage.length);
				}		
			}
			return mpackage;
		},

		getModule : function(mpackage) {
			var moduleCfg = Store.loadObject("_module_"+mpackage);
			if(! moduleCfg) {
				moduleCfg = this.loadMule(mpackage);
			}
			return moduleCfg;
		},

		init : function() {
			var curl = window.location.href;
			var mpackage = this.getPackage();
			if(!mpackage) {
				return;
			}
			this.module = this.getModule(mpackage);
			this.invoke = function(){};
			var isIndex =  curl.indexOf("index.html") > -1;
			var _this = this;
				_this.setResult = function(data, spage){
					if(data) {
						Store.saveObject(mpackage, data);
					}
					var mPage = new Page();
						if(mPage.goBack(spage)) {
							return true;
						}
						return false;
			};
			if(this.module && isIndex){
				
				requirejs.defaultConfig.paths[mpackage] = "../" + mpackage + "/module";
				requirejs.config(requirejs.defaultConfig);
				require([mpackage], function(M){
					if(! M) {
						return;
					}
					var module;				
					var setResult = function(data, spage) {
						if(data) {
							Store.saveObject(this.identifier, data);
						}
						var mPage = new Page();
						if(mPage.goBack(spage)) {
							return true;
						}
						return false;
					};
					if(typeof (M) == "function") {
						M.prototype.setResult = setResult;
						module = new M();
					}
					else {
						module.setResult = setResult;
						module = M;
					}
					if(module && module.setResult) {
						_this.setResult = function(data, spage){return module.setResult(data, spage)};
					}
						
				});
			}
			var nav_div = $("#nav_relates");
			if( this.module && this.module.relatesTo) {
				if(!this.module.relatesPage) {
					this.module.relatesPage = "index.html";
				}
				if(curl.indexOf("/"+this.module.relatesPage) > -1) {
					this.relatesTo = new Array();
					for(var i = 0; i < this.module.relatesTo.length; i++) {
						var tmodule = this.getModule(this.module.relatesTo[i]);
						if(tmodule) {
							this.relatesTo.push({name : tmodule.name, identifier : tmodule.identifier});
						}
					}
				}
				this.RenderRelatesHtml();
			}
			var rendDepends = false;
			if(this.module && this.module.dependsPage) {
				rendDepends = curl.indexOf("/"+this.module.dependsPage) > -1;
			}
			else if(isIndex) {
				rendDepends = true;
			}
			var nav_dependson = $("#nav_dependson");
			if(nav_dependson.length < 1 && this.module && rendDepends && this.module.dependsTo) {
				var dependsOn = this.module.dependsTo;
				this.dependsTo = new Array();
				for(var i = 0; i < dependsOn.length; i++) {
					var tmodule = this.getModule(dependsOn[i]);
					if(!tmodule) {
						continue;
					}
					this.RenderDependsOnHtml(tmodule);
					if(requirejs.defaultConfig) {
						requirejs.defaultConfig.paths[dependsOn[i]] = "../" + dependsOn[i] + "/module";
					}
					//require("../" + dependsOn[i] + "/module");							
				}
				//requirejs.defaultConfig.paths[mpackage] = "../" + mpackage + "/module";
				requirejs.config(requirejs.defaultConfig);
				/*for(var i = 0; i < dependsOn.length; i++) {
					this.dependsTo.push(require(dependsOn[i]));					
				}*/
				/*require(this.module.dependsTo, function(){
						//window[mpackage](arguments);
						alert(curl + mpackage);
				});*/
				
				this.invoke = function(tpackage, tmethod, args, callback) {
					require([tpackage], function(M){
						var module = new M();
						if(module && module[tmethod]) {
							callback.call(null, module[tmethod].call(module, args));
						}
						
					});
				};			
			}
			else {
				this.dependsTo = function(){};
			}		
			this.RenderScrollSpaceHtml();
		},

		RenderScrollSpaceHtml : function() {
			var nav_div = $("#nav_relates");
			if(nav_div.length > 0) {
				nav_div.append("<div style='width: 100%; height: 200px;'>&nbsp;</div>");
			}
		},

		RenderDependsOnHtml : function(module) {
			var title = this.module.dependsToTitle || "其他信息";
			var nav_div = $("#nav_relates");
			var item;
			var icon = module.icon || "icon.png";
			icon = "../"+module.identifier+"/"+icon;
			if(nav_div.length < 1) {
				if($("#slidemenucss").length < 1) {
					$(document.body).append("<link id='slidemenucss' href='../vendor/cube/css/slide-menu.css' rel='stylesheet'/>");
				}
				//var cubeNav = $("header[class=cube-nav] > .cube-nav-toolbar");
				//cubeNav.append("<div class='cube-nav-toolbar-right'><a class='menu-open' href='#nav_relates'></a></div>");
				//var topDiv = $("#topDiv").addClass("menu-content");
				nav_div = $("<div id='nav_relates' class='slide-menu'></div>").appendTo($(document.body));
				nav_div.append("<ul class='slide-menu-ref'>" + title + "</ul>");
				var nav_dependson = $("<ul id='nav_dependson'></ul>").appendTo(nav_div);
				item = $("<a href='#'>"+module.name+"</a>");
				$("<li></li>").append(item).appendTo(nav_dependson);
				new Menu(".menu-open");
			}
			else {
				var nav_dependson = $("#nav_dependson");
				var nav_div = $("#nav_relates");
				if(nav_dependson.length < 1) {
					nav_div.append("<ul class='slide-menu-ref'>" + title + "</ul>");
					var nav_dependson = $("<ul id='nav_dependson'></ul>").appendTo(nav_div);
				}
				item = $("<a href='#'></a>");
				if(window.dependMenuId) {
					window.dependMenuId++;
				} else {
					window.dependMenuId = 0;
				}
				var theDependMenuId = window.dependMenuId++;
				item.attr('id', 'depenMenuId'+theDependMenuId);
				var iconHtml = "<img style='vertical-align:middle;padding:1px;margin:0;border:0;width : 30px; height : 30px;' src='"+icon+"'></img>";
				item.html("<div style='width : 100%;'>"+iconHtml+"<span>&nbsp;&nbsp;"+module.name+"</span></div>");
				$("<li></li>").append(item).appendTo(nav_dependson);
			}
			var mIdentifier = module.identifier;
			$('#depenMenuId'+theDependMenuId).on('click', function(){
				$.pageslide.close();
				var mpage = new Page();
				mpage.gotoPageForResult("../com.csair.flightstatus/index.html?cube-action=push", mIdentifier);
			});
		},

		RenderRelatesHtml : function() {
			if(this.relatesTo && this.relatesTo.length > 0) {
				//var identifier = this.module.identifier;
				if($("#slidemenucss").length < 1) {
					$(document.body).append("<link id='slidemenucss' href='../vendor/cube/css/slide-menu.css' rel='stylesheet'/>");
				}
				//var cubeNav = $("header[class=cube-nav] > .cube-nav-toolbar");
				//cubeNav.append("<div class='cube-nav-toolbar-right'><a class='menu-open' href='#nav_relates'></a></div>");
				//var topDiv = $(".cube-layout-nav-fixtop");
				//var topDiv = $("#topDiv").addClass("menu-content");

				/*
				nav_relates = $("<ul id='nav_relates' class='slide-menu'></ul>").appendTo($(document.body));
				for(var i = 0; i < this.relatesTo.length; i++) {
					nav_relates.append("<li><a href='"+"../"+ this.relatesTo[i].identifier +"/index.html'>"+this.relatesTo[i].name+"</a></li>");
				}
				*/

				var nav_div = $("<div id='nav_relates' class='slide-menu'></div>").appendTo($(document.body));
				nav_div.append("<ul class='slide-menu-ref'>相关信息</ul>");
				var nav_relates = $("<ul ></ul>").appendTo(nav_div);
				if(window.relatesMenuId) {
					window.relatesMenuId++;
				} else {
					window.relatesMenuId = 1;
				}
				for(var i = 0; i < this.relatesTo.length; i++) {
					var theRelatesMenuId = window.relatesMenuId++;
					var icon = "../"+this.relatesTo[i].identifier+"/"+(this.relatesTo[i].icon || "icon.png");
					var item = $("<a href='#'></a>");
					item.attr("id", 'relatesMenuId'+theRelatesMenuId);
					var iconHtml = "<img style='vertical-align:middle;padding:1px;margin:0;border:0;width : 30px; height : 30px;' src='"+icon+"'></img>";
					item.html("<div style='width : 100%;'>" + iconHtml + "<span>&nbsp;&nbsp;"+this.relatesTo[i].name+"</span></div>");
					//window.relatesMenuId++;					
					nav_relates.append($("<li></li>").append(item));
					var url = "../"+ this.relatesTo[i].identifier +"/index.html?SwitchRefer=true&cube-action=push";
					item.attr("goURL", url);
					$('#relatesMenuId'+theRelatesMenuId).on('click', function(){
						$.pageslide.close();						
						window.location.href = $(this).attr("goURL");;
					});
				}

				

				//topDiv.append(nav_relates);
				//$(document.body).append(nav_relates);
				new Menu(".menu-open", {iScroll : iScroll});
				/*new iScroll(this.config['nav_relates'], {
					useTransition: true
				}).refresh();*/
			}
		}



	/*
			if(false)
			if(reqPamas.length > 0 && reqPamas["depTo"]) {
				var req = reqPamas["depTo"];
				module.isDepended = true;
				module.setResult = function(resultObj) {
					var url = "../"+reqPamas["depFrom"]+"/index.html?depResult=true&depFrom="+reqPamas["depFrom"];
					for (var property in resultObj) {
						if(property != "__proto__") {
							url = url + "&" + property + "=" +resultObj[property];
						}			
					}
					var depFrom = Store.loadObject("modules_dep");
					if(depFrom.depParam) {
						var params = depFrom.depParam;
						for(var i = 0; i < params.length; i++) {
							var paraName = params[i].name;
							if(params[i].required && !resultObj[paraName]) {
								
								alert("参数" + paraName + "必须设置值");
								return;
							}
							//alert(paraName);
							
							if(resultObj[paraName]) {
								url = url + "&"+paraName+"="+resultObj[paraName];
								//console.log('>> '+paraName+'= '+ resultObj[paraName]);
								//console.log('>> '+url);
							}
							
						}
					}
					
					window.location.href = url;
				};
			}
		}
	*/
	}, {
		compile: function(){
			
		}
    });
	return Module;
});