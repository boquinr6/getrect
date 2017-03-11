Game.MainMenu = function(game){
    
};

Game.MainMenu.prototype = {
  create:function(game){
      
  },
    udate:function(game){
        
    },
    createButton:function(game,string,x,y,w,h,callback){
        var button1 = game.add.button(x,y,'button',callback);
    }
};