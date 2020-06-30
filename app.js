const budgetController = (function () {
  const Expense = function (id, desc, value, percentage) {
    this.id = id;
    this.desc = desc;
    this.value = value;
    this.percentage = -1;
  };

  Expense.prototype.calcPercentage = function (totalInc) {
    if (totalInc > 0) {
      this.percentage = Math.round((this.value / totalInc) * 100);
    } else {
      this.percentage = -1;
    }
  };

  Expense.prototype.getPercentage = function () {
    return this.percentage;
  };

  const Income = function (id, desc, value) {
    this.id = id;
    this.desc = desc;
    this.value = value;
  };

  const data = {
    allItems: {
      exp: [],
      inc: [],
    },
    totals: {
      exp: 0,
      inc: 0,
    },
    budget: 0,
    precentage: 0,
  };

  const calculateTotal = function (type) {
    let sum = 0;
    data.allItems[type].forEach((el) => {
      sum += el.value;
    });
    data.totals[type] = sum;
  };

  return {
    addItem: function (type, desc, value) {
      let ID, newItem;

      // Create new ID
      if (data.allItems[type].length < 1) {
        ID = 0;
      } else {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      }

      // Create new item
      if (type === `inc`) {
        newItem = new Income(ID, desc, value);
      } else if (type === `exp`) {
        newItem = new Expense(ID, desc, value);
      }

      // Add new item to data
      data.allItems[type].push(newItem);

      return newItem;
    },
    deleteItem: function (type, id) {
      let ids, index;
      ids = data.allItems[type].map((el) => {
        return el.id;
      });
      index = ids.indexOf(id);
      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },
    calculateBudget: function () {
      // sum all exp/inc into total exp/inc
      calculateTotal(`inc`);
      calculateTotal(`exp`);

      // calculate budget
      data.budget = data.totals.inc - data.totals.exp;

      // calculate percentage
      data.budget > 0
        ? (data.precentage = Math.round(
            (data.totals.exp / data.totals.inc) * 100
          ))
        : (data.precentage = -1);
    },
    calculatePercentages: function () {
      data.allItems.exp.forEach((el) => {
        el.calcPercentage(data.totals.inc);
      });
    },
    getPercentages: function () {
      const allPerc = data.allItems.exp.map((el) => {
        return el.getPercentage();
      });
      return allPerc;
    },
    getBudget: function () {
      return {
        budget: data.budget,
        percentage: data.precentage,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
      };
    },
  };
})();

const UIController = (function () {
  const DOMstrings = {
    inputType: `.add__type`,
    inputDesc: `.add__description`,
    inputValue: `.add__value`,
    inputBtn: `.add__btn`,
    expensesList: `.expenses__list`,
    incomeList: `.income__list`,
    totalBudget: `.budget__value`,
    budgetIncome: `.budget__income--value`,
    budgetExpenses: `.budget__expenses--value`,
    budgetExpensesPercentage: `.budget__expenses--percentage`,
    container: `.container`,
    singlePercentage: `.item__percentage`,
    date: `.budget__title--month`,
  };
  const formatNumber = function (num, type) {
    let numSplit, int, dec;

    num = Math.abs(num);
    num = num.toFixed(2);

    numSplit = num.split(`.`);

    int = numSplit[0];
    dec = numSplit[1];

    if (int.length > 3) {
      int = `${int.substr(0, int.length - 3)},${int.substr(int.length - 3, 3)}`;
    }

    return `${type === `exp` ? `-` : `+`} ${int}.${dec}`;
  };
  const nodeListForEach = function (list, callback) {
    for (let i = 0; i < list.length; i++) {
      callback(list[i], i);
    }
  };
  return {
    getInput: function () {
      return {
        type: document.querySelector(DOMstrings.inputType).value,
        desc: document.querySelector(DOMstrings.inputDesc).value,
        value: parseFloat(document.querySelector(DOMstrings.inputValue).value),
      };
    },
    addListItem: function (obj, type) {
      let html, newHtml, element;

      if (type === `inc`) {
        element = DOMstrings.incomeList;
        html = `<div class="item clearfix" id="inc-%id%">
              <div class="item__description">%desc%</div>
              <div class="right clearfix">
                  <div class="item__value">%value%</div>
                  <div class="item__delete">
                      <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                  </div>
              </div>
          </div>`;
      } else if (type === `exp`) {
        element = DOMstrings.expensesList;
        html = `<div class="item clearfix" id="exp-%id%">
              <div class="item__description">%desc%</div>
              <div class="right clearfix">
                  <div class="item__value">%value%</div>
                  <div class="item__percentage">%percentage%</div>
                  <div class="item__delete">
                      <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                  </div>
              </div>
          </div>`;
      }

      newHtml = html.replace(`%id%`, obj.id);
      newHtml = newHtml.replace(`%desc%`, obj.desc);
      newHtml = newHtml.replace(`%value%`, formatNumber(obj.value, type));

      document.querySelector(element).insertAdjacentHTML(`beforeend`, newHtml);
    },
    deleteListItem: function (selectorID) {
      const element = document.getElementById(selectorID);

      element.parentNode.removeChild(element);
    },
    clearFields: function () {
      let fields, fieldsArray;

      fields = document.querySelectorAll(
        `${DOMstrings.inputDesc}, ${DOMstrings.inputValue}`
      );

      fieldsArray = Array.prototype.slice.call(fields);

      fieldsArray.forEach((el) => {
        el.value = ``;
      });

      fieldsArray[0].focus();
    },
    displayBudget: function (obj) {
      let type;
      obj.budget > 0 ? (type = `inc`) : (type = `exp`);

      document.querySelector(DOMstrings.totalBudget).textContent = formatNumber(
        obj.budget,
        type
      );
      document.querySelector(
        DOMstrings.budgetIncome
      ).textContent = formatNumber(obj.totalInc, `inc`);
      document.querySelector(
        DOMstrings.budgetExpenses
      ).textContent = formatNumber(obj.totalExp, `exp`);

      let budgetPercentage = document.querySelector(
        DOMstrings.budgetExpensesPercentage
      );

      if (obj.percentage > 0) {
        budgetPercentage.textContent = `${parseFloat(obj.percentage)}%`;
      } else if (parseFloat(obj.percentage) < 0) {
        budgetPercentage.textContent = `---`;
      }
      // obj.percentage > 0
      //   ? (budgetPercentage.textContent = `${obj.percentage}%`)
      //   : (budgetPercentage.textContent = `---`);
    },
    displayPercentages: function (percentages) {
      const fields = document.querySelectorAll(DOMstrings.singlePercentage);

      nodeListForEach(fields, function (current, index) {
        if (percentages[index] > 0) {
          current.textContent = `${percentages[index]}%`;
        } else {
          current.textContent = `---`;
        }
      });
    },
    displayDate: function () {
      let now, year;

      now = new Date();
      month = now.toLocaleString("en-us", { month: "long" });
      year = now.getFullYear();

      document.querySelector(DOMstrings.date).textContent = `${month} ${year}`;
    },
    changedType: function () {
      const fields = document.querySelectorAll(
        `${DOMstrings.inputType}, ${DOMstrings.inputDesc}, ${DOMstrings.inputValue}`
      );

      nodeListForEach(fields, function (el) {
        el.classList.toggle(`red-focus`);
      });

      document.querySelector(DOMstrings.inputBtn).classList.toggle(`red`);
    },
    getDOMstrings: function () {
      return DOMstrings;
    },
  };
})();

const controller = (function (budgetCtrl, UICtrl) {
  function setupEventListeners() {
    const DOM = UICtrl.getDOMstrings();
    document.querySelector(DOM.inputBtn).addEventListener(`click`, ctrlAddItem);

    window.addEventListener(`keypress`, function (event) {
      if (event.keyCode === 13 || event.which === 13) {
        event.preventDefault();
        ctrlAddItem();
      }
    });

    document
      .querySelector(DOM.container)
      .addEventListener(`click`, ctrlDeleteItem);

    document
      .querySelector(DOM.inputType)
      .addEventListener(`change`, UICtrl.changedType);
  }
  const budgetUpdate = function () {
    // calc the budget
    budgetCtrl.calculateBudget();

    // return budget
    const budget = budgetCtrl.getBudget();

    // display budget
    UICtrl.displayBudget(budget);
  };

  const updatePercentages = function () {
    //calc percentages
    budgetCtrl.calculatePercentages();
    //read percentages from budget
    const percentages = budgetCtrl.getPercentages();
    //update UI
    UICtrl.displayPercentages(percentages);
  };

  const ctrlAddItem = function () {
    // get field input data
    const input = UICtrl.getInput();

    if (input.desc !== `` && !isNaN(input.value) && input.value > 0) {
      //add the item to budget controllet
      const newItem = budgetCtrl.addItem(input.type, input.desc, input.value);

      //add the item to UI
      const addListItem = UICtrl.addListItem(newItem, input.type);

      //clear input fields
      const clearFields = UICtrl.clearFields();

      //update the budget
      budgetUpdate();

      //update the percentages of expenses
      updatePercentages();
    }
  };
  const ctrlDeleteItem = function (event) {
    let itemID, splitID;

    // choose exact element
    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
    if (itemID) {
      splitID = itemID.split(`-`);
      type = splitID[0];
      ID = parseInt(splitID[1]);

      // delete from the data
      budgetCtrl.deleteItem(type, ID);

      // delete from the UI
      UICtrl.deleteListItem(itemID);

      //update budget
      budgetUpdate();

      //update the percentages of expenses
      updatePercentages();
    }
  };
  return {
    init: function () {
      UICtrl.displayDate();
      UICtrl.displayBudget({
        budget: 0,
        percentage: -1,
        totalInc: 0,
        totalExp: 0,
      });
      setupEventListeners();
    },
  };
})(budgetController, UIController);

controller.init();
