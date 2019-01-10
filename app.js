/* BUDGET CONTROLLER */
var budgetController  = (function(){

    var Expense = function(id,description,value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.precentage = -1;
    };

    Expense.prototype.calcPercantge = function(totalIncome){
        if(totalIncome > 0){
            this.precentage = Math.round((this.value / totalIncome) * 100);
        }
        else
        this.precentage = -1;
    };

    Expense.prototype.getPrecentage = function(){
        return this.precentage;
    };

    var Income = function(id,description,value){
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calaculateTotal = function(type){
        var sum = 0;
        data.allItems[type].forEach(function(current){
            sum += current.value;
        });
        data.totals[type] = sum;

    };

    var data = {
          allItems : {
                exp : [],
                inc : []
            },

            totals: {
                exp :0,
                inc: 0,
            },

            budget :0,
            precentage : -1,

        };

        return {

            addItem : function(type,des,val) {

                var newItem,ID;
                //create new id,then recreate new item based on in or exp type
                if(data.allItems[type].length > 0)
                    ID = data.allItems[type][data.allItems[type].length - 1].id +1;
                    else
                    ID = 0; 

                if(type === 'exp')
                    newItem = new Expense(ID,des,val);
                        else
                          newItem = new Income(ID,des,val);   

                     data.allItems[type].push(newItem);
                     return newItem; 
            }, 

            deleteItem : function(type,id) {
                var ids,index;
                ids = data.allItems[type].map(function(current){
                    return current.id;
                });

                index = ids.indexOf(id);

                if(index !== -1){
                    data.allItems[type].splice(index,1);
                }
            },

            calculateBudget : function(){ 
                //calaculate all income and expenss
                calaculateTotal('exp');
                calaculateTotal('inc');

                //calculate the budget
                data.budget = data.totals.inc - data.totals.exp;
                //calculate the precentage of the income thth we spent
                if(data.totals.inc > 0)
                    data.precentage = Math.round((data.totals.exp / data.totals.inc) *100);
                else
                    data.precentage = -1;
            },

            caluculatePrecentags : function() {

                data.allItems.exp.forEach(function(curr){
                    curr.calcPercantge(data.totals.inc);
                });
            },

            getPrecentage : function(){
                var allper = data.allItems.exp.map(function(curr) {
                    return curr.getPrecentage();
                });
                return allper;
            },

            getBudget : function(){
                return {
                    budget : data.budget,
                    totalInc : data.totals.inc,
                    totalExp : data.totals.exp,
                    precentage : data.precentage
                };
            },

            testign : function() {
                console.log(data); 
            }
        };
})(); 




/* UI Controller */
var UIController =(function(){
   
    var DOMstrings = {
        inptType : '.add__type',
        description :'.add__description',
        value :'.add__value',
        inputBtn : '.add__btn',
        incomeContainer :'.income__list',
        expenssesContainer :'.expenses__list',
        budgetLabel : '.budget__value',
        incomeLabel: '.budget__income--value',
        expenssesLabel: '.budget__expenses--value',
        prcentageLabel: '.budget__expenses--percentage',
        container : '.container',
        expencessPerLabel :'.item__percentage',
        dateLabel : '.budget__title--month'
    };

   var formatNumber = function (num,type){
        var numSplit,int,dec;

        num = Math.abs(num);

        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];

        if(int.length > 3){ 
            int = int.substr(0,int.length -3) + ',' + int.substr(int.length-3,3);
        }

        dec = numSplit[1];
    
        return (type === 'exp' ? '-' :'+') + ' ' + int + '.'+  dec;
    };

    var nodelistForEach = function(list,callback){

        for(var i = 0 ; i < list.length;i++){
            callback(list[i],i);
        }

    };

    return {

        getInput : function(){
            return {
                type : document.querySelector(DOMstrings.inptType).value, //inc or exp
                description : document.querySelector(DOMstrings.description).value,
                value : parseFloat(document.querySelector(DOMstrings.value).value),
            };
        },

        addListItem : function(obj,type){
            var html,newhtml,element;
            //create an html string with some placeholde tags

            if(type === 'inc'){
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div></div></div>';

            }
            else{
                element = DOMstrings.expenssesContainer;
                html = '<div class="item clearfix" id="exp-0"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
 

            //replace the plachokder with some actual data
            newhtml = html.replace('%id%',obj.id);
            newhtml = newhtml.replace('%description%',obj.description);
            newhtml = newhtml.replace('%value%',formatNumber(obj.value,type));


            //insert the html into the dom 
            document.querySelector(element).insertAdjacentHTML('beforeend', newhtml);
        },

        deleteListItem : function(selectorID){ 

            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
            
        },

        clearFields : function(){
            var fields,fuledsArray;
            fields = document.querySelectorAll(DOMstrings.description + ', ' + DOMstrings.value)
            fuledsArray = Array.prototype.slice.call(fields);  
            
            fuledsArray.forEach(function(current,index,array) {
                current.value ="";

            });

            fuledsArray[0].focus(); 
        }, 

        displayBudget : function(obj){ 
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget,type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc,'inc');
            document.querySelector(DOMstrings.expenssesLabel).textContent = formatNumber(obj.totalExp,'exp');

            if(obj.precentage > 0)
                document.querySelector(DOMstrings.prcentageLabel).textContent = obj.precentage + '%';
            else
            document.querySelector(DOMstrings.prcentageLabel).textContent = '---';
        },

        displayPercentages : function(percentages) {

            var fields = document.querySelectorAll(DOMstrings.expencessPerLabel);

            nodelistForEach(fields, function(current,index){

                if(percentages[index] > 0)
                    current.textContent =percentages[index] + '%';
                else
                    current.textContent = '--';
            });
        },

        displayMoonth : function() {
            var now,year,month,months; 
            months =['Jan','Feb','Mer','April','May','Jone','july','August','Sep','Oct','Nov','Dec'];
            now = new Date();
            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
        },

        changeType : function (){  
 
            var fields = document.querySelectorAll(
                DOMstrings.inptType + ',' + DOMstrings.description + ',' + DOMstrings.value
            );
            
            nodelistForEach(fields,function(cur) { 
                cur.classList.toggle('red-focus');
            });
            
            document.querySelector(DOMstrings.inputBtn).classList.toggle('red'); 
        },

        getDOMstring : function() {
            return DOMstrings;
        },
    };

})();


 

/* GLOBAL APP CONROLLER */
var controller = (function(budgetCtrl,UICtrl) {


    var setUpEventLiseteners = function(){

        var DOM = UICtrl.getDOMstring(); 

        document.querySelector(DOM.inputBtn).addEventListener('click',ctrlAdItem)

        document.addEventListener('keypress',function(event){
    
            if(event.keyCode === 13)
               ctrlAdItem();
        });

        document.querySelector(DOM.container).addEventListener('click',ctrlDeleteItem);
        document.querySelector(DOM.inptType).addEventListener('change',UICtrl.changeType);
    };

    var updateBudgete = function(){

        //caluculate the budget
        budgetCtrl.calculateBudget();
 
        //return the budget
        var budget = budgetCtrl.getBudget();

        //display the budget to the UI

       UICtrl.displayBudget(budget);

    };

    var updatePrecentages = function(){
 
        budgetCtrl.caluculatePrecentags();

        var percentage= budgetCtrl.getPrecentage();

        UICtrl.displayPercentages(percentage);

    };

    var ctrlAdItem = function(){

        var input,newItem;
        input = UICtrl.getInput();

        if(input.description !== "" && !isNaN(input.value) && input.value > 0)
        {
            newItem = budgetCtrl.addItem(input.type,input.description,input.value);

            UICtrl.addListItem(newItem,input.type);
    
            UICtrl.clearFields(); 
            
            updateBudgete();

            updatePrecentages();
        }
    };

    var ctrlDeleteItem = function(event){ 

        var item = event.target; 
        var itemID;

        while(!item.id /* || (item.id && !(item.id.startsWith('inc') || item.id.startsWith('exp'))) */) 
            item = item.parentNode;

        itemID = item.id;

        if(itemID){
            var splitId,type,ID;
            splitId = itemID.split('-');
            type = splitId[0];
            ID = parseInt(splitId[1]);  

            budgetCtrl.deleteItem(type,ID);//delete from the data structure
            UICtrl.deleteListItem(itemID);//delete from the UI
            updateBudgete();//update the budget

            updatePrecentages();
        }
    };

    return {
        init : function(){
            UICtrl.displayMoonth();
            UICtrl.displayBudget({
                
                    budget : 0,
                    totalInc : 0,
                    totalExp : 0,
                    precentage : -1,
            }); 

            setUpEventLiseteners(); 
        }
    }

})(budgetController,UIController);

controller.init(); 
