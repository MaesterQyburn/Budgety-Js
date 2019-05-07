var budgetController = (function()
{
    var Expense = function(id,description,value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    
    Expense.prototype.calcPercentage = function(totlalIncome)
    {
        if(totlalIncome > 0)
        {
            this.percentage = Math.round((this.value / totlalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };
    
    Expense.prototype.getPercentage = function()
    {
        return this.percentage;
    };

    var Income = function(id,description,value){
        this.id = id;
        this.description = description;
        this.value = value;
    };

  
    var calculateTotal = function(type)
    {
        var sum = 0;
        data.allItems[type].forEach(function(cur)
        {
            sum += cur.value;
        });
        data.totals[type] = sum;
    };

    var totalExpenses = [];

    var data = {
        allItems: {
           exp: [],
           inc: [] 
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };

    return {
        addItem: function(type,des,val)
        {
            var newItem;

            
            //id = last id + 1
            if(data.allItems[type].length > 0){
                id = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }else {
                id = 0;
            }
            // Create new item based on 'inc' pr 'exp'
            if(type === 'exp') {
                newItem = new Expense(id,des,val);
            }else if(type === 'inc') {
                newItem = new Income(id,des,val);   
            }

            // Push into our data structure
            data.allItems[type].push(newItem);

            // Return the new element
            return newItem; 
        },

        deleteItem: function(type, id)
        {
            // id = 3
            var ids = data.allItems[type].map(function(current)
            {
                return current.id;
            });
            index = ids.indexOf(id);

            if(index !== -1)
            {
                data.allItems[type].splice(index,1);
            }
        },
        calculateBudget: function()
        {
            // calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');
            
            // calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            // calculate the percentage of income that we spent
            if(data.totals.inc > 0)
            {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            }
            else{
                data.percentage = -1;
            }       
        },

        calculatePercentages: function()
        {
            data.allItems.exp.forEach(function(cur)
            {
                cur.calcPercentage(data.totals.inc);
            });
        },
        getPercentages: function()
        {
            var allPerc = data.allItems.exp.map(function(cur)
            {
                return cur.getPercentage();
            });
            return allPerc;
        } ,

        getBudget: function()
        {
            return{
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },

        testing: function()
        {
            console.log(data);
            
        }
        
    };
})();

var UIcontroller = (function()
{
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };
    
    var formatNumber = function(num,type)
    {
        num = Math.abs(num);
        num = num.toFixed(2);
    
        // Coma seperator
        var numSplit = num.split('.');
         var int = numSplit[0];
        if(int.length > 3){
            // input: 2500 => output: 2,500
            int = int.substr(0,int.length - 3) + ',' + int.substr(int.length - 3,3);
        }
                
        var dec = numSplit[1];
        var sign;
        type === 'exp' ? sign = '-' : sign = '+';
    
        return sign + ' ' + int + '.' + dec;
    };
    var nodeListForEach = function(list,callback)
    {
        for(var i=0; i < list.length; i++)
        {
            callback(list[i],i);
        }
    };
    return{
        getInput: function()
        {
            return{
                type:document.querySelector(DOMstrings.inputType).value,
                description:document.querySelector(DOMstrings.inputDescription).value,
                value:parseFloat(document.querySelector(DOMstrings.inputValue).value),
            };
        },

        getDOMstrings: function()
        {
            return DOMstrings;
        },
        addListItem: function(obj,type)
        {
            // Create HTML string with Placeholder text
            var html, newHtml,element;
            if(type === 'inc') {
                element = DOMstrings.incomeContainer;
            html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if(type === 'exp'){
                element = DOMstrings.expenseContainer;
            html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div> <div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            // Replace the placeholder text with some actual data
            newHtml = html.replace('%id%',obj.id);
            newHtml = newHtml.replace('%description%',obj.description);
            newHtml = newHtml.replace('%value%',formatNumber(obj.value,type));

            //Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);
             
        },

        deleteListItem: function(selectorID)
        {
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);

        },
        
        clearFields: function()
        {
            var fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
            var fieldsArray = Array.prototype.slice.call(fields);
        
            fieldsArray.forEach(function(current, index, array)
            {
                current.value = "";
            });

            fieldsArray[0].focus();
        },

        displayBudget: function(obj)
        {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget,type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expenseLabel).textContent = formatNumber(obj.totalExp,'exp');
            
            if(obj.percentage > 0)
            {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
        },

        displayMonth: function()
        {
            var date = new Date();
            var year = date.getFullYear();
            var month = date.getMonth();

            var months = ['January', 'February', 'March', 'April', 'May', 'June' ,'August','September', 'October', 'November','December'];

            document.querySelector(DOMstrings.dateLabel).textContent= months[month] + ' ' + year;
        },

        changedType: function()
        {
            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue
            );
            nodeListForEach(fields, function(cur)
            {
                cur.classList.toggle('red-focus');
            });
            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        },
        displayPercentages: function(percentages)
        {
            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

            nodeListForEach(fields, function (current, index) {
                if(percentages[index]>0)
                {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });
        }
        

    };
})();

var controller = (function(budgetctrl,UIctrl)
{
    var setupEventListners = function()
    {
        
        var DOM = UIctrl.getDOMstrings();

        document.querySelector(DOM.inputBtn).addEventListener('click',ctrlAddItem);
        
        document.addEventListener('keypress',function(event)
        {
            if(event.keycode === 13 || event.which === 13)
            {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click',ctrlDeleteItem);
        document.querySelector(DOM.inputType).addEventListener('change', UIctrl.changedType);
    };

    var updateBudget = function()
    {
        // 1. Calculate the budget
        budgetctrl.calculateBudget();
        
        // 2. return the budget
        var budget = budgetctrl.getBudget();

        // 3. Display the budget on the UI
        UIctrl.displayBudget(budget);
    };

    var updatePercentage = function()
    {
        // 1. Calculate Percentage
        budgetctrl.calculatePercentages();
        // 2. Read percentage from the budget controller
        var percentages = budgetController.getPercentages();
        // 3. update the UI with the new percentage
        UIctrl.displayPercentages(percentages);
        
    };
    var ctrlAddItem = function()
    {
        // 1. Get the field input data
        var input = UIctrl.getInput();
    
        if(input.description !== "" && !isNaN(input.value) && input.value > 0)
        {
            //2. Add the item to budget controller
            var newItem = budgetctrl.addItem(input.type,input.description,input.value);

            // 3. Add the item to the UI
            UIctrl.addListItem(newItem,input.type);

            // 4. For clear the fields
            UIctrl.clearFields();

            // 5. Calculate and update budget
            updateBudget();

            // 6. Calculate and update the percentages
            updatePercentage();
        }
    };

    var ctrlDeleteItem = function(event)
    {
        var itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if(itemID)
        {
            //inc-1
            var splitID = itemID.split('-');
            var type = splitID[0];
            var ID = parseInt(splitID[1]);

            // 1. delete the item from the data structure
            budgetctrl.deleteItem(type,ID);
            
            // 2. delete the item from the UI
            UIctrl.deleteListItem(itemID);
            
            // 3. Update and show the next budget
            updateBudget();

            // 4. Calculate and update the percentages
            updatePercentage();
        }
    };

    return{
        init: function(){
            console.log('Application has started');
            UIctrl.displayMonth();
            UIctrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: 0
            });
            setupEventListners();
        }
    }
   
})(budgetController,UIcontroller);

controller.init();