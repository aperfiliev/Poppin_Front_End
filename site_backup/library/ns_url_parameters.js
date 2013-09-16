
/*

v=2011.2.0.102 
db=86 
c=1339179 
n=1 
rg=3 
e=0 
r=17 
ct=WEBSITE 
isstore=T 
https=T
id= 
cat= 
sc=42 
sct=PRESENTATION 
thm=104
cart=142 (serno=1) 
price=5 
cur=3 
lang=en_US 
partner=0 
promocode=0 
leadsource=
sobcform=76 
sco=F
page(candbc=F fromdbc=F vol=F)

*/

/*

Retrieves a parameter value by quering the first comment included by the NS system.

Example usage: 

NS_parameters.Search('rg');
NS_parameters.Search('lang');

Notice, the function break the comments into an array with the space being considered as the delimiter, there are then parameters whose NS formatting gets unusable for use with this function. Example:
 - cart=142 (serno=1) 
 - page(candbc=F fromdbc=F vol=F)

*/

var NS_parameters = {
    Params: [],
    CurIndex: 0,
	Initialized: false,
	Start: function(){
		var head_tag = document.getElementsByTagName('head')[0].innerHTML;
		this.Params = head_tag.split('<!-- ')[1].split(' -->')[0].replace(/\s+/g, " ").split(' ');
		this.Initialized = true;		
	},
    Search: function(param) {
		try{
			if (!this.Initialized)
				this.Start();
    
			value = "undefined";
			
			if (typeof this.Params !== "undefined"){
				for (p in this.Params){
					if((this.Params[p]).indexOf(param+'=') > -1){
						value = this.Params[p].split('=')[1];
						break;
					}
				}
			}
			
			return value 
		}
		catch(e){}		
    }
};


