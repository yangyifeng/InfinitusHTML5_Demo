define(['cube/view', 'cube/store', 'text!listView.html'],
function(CubeView, Store, listViewTemplate){

    return CubeView.extend({

        page: '',
        el: 'body',

        render: function(){

            $(this.el).html('');
            $(this.el).append(listViewTemplate);

            CubeView.prototype.render.call(this);
        }
    });
});