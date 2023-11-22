initializeCalculator();
function initializeCalculator() {
  let first = {value: "", unsaved: true, saved: false, integer: true};
  let second = {value: "", unsaved: true, saved: false, integer: true};
  let operator = {value: "", unsaved: true, saved: false};
  let result = "";
  let allowNewNumber = false;

  listenClicks();
  listenKeys();

  function listenKeys() {
    window.addEventListener("keydown", event => {
      const key = document.querySelector(`[data-key="${event.key}"]`);
      if (key) {
        bindEvent(key.id);
        key.focus(); // Safari and Firefox don't handle focus in CSS files
      }
    });
  }

  function listenClicks() {
    const buttons = document.querySelectorAll(".btn");
    buttons.forEach(button => {
      button.addEventListener("click", event => {
        const click = event.target;
        bindEvent(click.id);
        click.focus(); // Safari and Firefox don't handle focus in CSS files
      });
    });
  }

  function bindEvent(event) {
    if (["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"].includes(event)) {
      addOperand(event);
    }
    if (["+", "-", "÷", "×", "^"].includes(event)) {
      addOperator(event);
    }
    switch (event) {
      case "=":
        evaluateExpression(first, operator, second);
        break;
      case ".":
        addDecimal(event);
        break;
      case "+/-":
        getOpposite();
        break;
      case "%":
        getPercentage();
        break;
      case "ac":
        clearExpression();
        break;
    }
    updateClearbutton("AC", "C");
    updateDisplay(first.value, operator.value, second.value, result);
    console.table({
      first: first,
      operator: operator,
      second: second,
      result: result,
      new: allowNewNumber
    });
  }

  function addOperand(operandEvent) {
    // Handle the other digits for the second number
    if (first.saved && operator.saved && second.saved) {
      second.value += operandEvent;
      // Handle the leading zero for the second number
      if (second.value.startsWith("0") && second.value.slice(1, 2) !== ".") {
        second.value = second.value.substring(1);
      }
    }
    // Save the first digit for the second number
    if (first.saved && operator.saved && second.unsaved) {
      second.value = operandEvent;
      saveData(second);
    }
    // Save the other digits for the first number
    if (first.saved && operator.unsaved && second.unsaved) {
      first.value += operandEvent;
      // Handle the leading zero for the first number
      if (first.value.startsWith("0") && first.value.slice(1, 2) !== ".") {
        first.value = first.value.substring(1);
      }
      // Allow a new operation thanks to a previous result
      if (allowNewNumber) {
        first.value = operandEvent;
        result = "";
        allowNewNumber = false;
      }
    }
    // Save the first digit for the first number
    if (first.unsaved) {
      first.value = operandEvent;
      saveData(first);
    }
  }

  function addOperator(operatorEvent) {
    // Evaluate expression when chaining operations with a new sign
    if (first.saved && operator.saved && second.saved) {
      evaluateExpression(first, operator, second);
    }
    if (operatorEvent === "-" && operator.saved && second.unsaved) {
      // Allow a leading minus sign for the second number
      second.value = operatorEvent;
      saveData(second);
      // Handle both negative sign and number
      if (operator.value === "-" && second.value.startsWith("-")) {
        operator.value = "+";
        resetData(second);
      }
      // Handle a plus sign and followed by a negative second number
      if (operator.value === "+" && second.value.startsWith("-")) {
        operator.value = "-";
        second.value = second.value.substring(1);
        resetData(second);
      }
    }
    // Save the sign for the expression
    if (first.saved && operator.unsaved && first.value !== "-") {
      operator.value = operatorEvent;
      saveData(operator);
    }
    // Allow a leading minus sign for the first number
    if (operatorEvent === "-" && first.unsaved && operator.unsaved) {
      first.value = operatorEvent;
      saveData(first);
    }
  }

  function evaluateExpression(first, operator, second) {
    // Handle a complete expression
    if (first.saved && operator.saved && second.saved) {
      // Handle a single minus sign as a second number, like 25x-
      if (second.value === "-") {
        return;
      }
      result = operate(first.value, operator.value, second.value);
    }
    // Handle a single first number followed by a sign
    if (first.saved && operator.saved && second.unsaved) {
      second.value = first.value;
      result = operate(first.value, operator.value, second.value);
    }
    // Handle a single first number
    if (first.saved && operator.unsaved && second.unsaved) {
      result = first.value;
    }
    // Handle an empty expression
    if (first.unsaved && operator.unsaved && second.unsaved) {
      result = "0";
    }
    // Allow to chain expression when adding a sign
    if (result !== "Error") {
      first.value = result;
      allowNewNumber = true;
      [operator, second].forEach(element => resetData(element));
    } else {
      [first, operator, second].forEach(element => resetData(element));
    }
  }

  function operate(first, sign, second) {
    const a = Number(first);
    const b = Number(second);
    switch (sign) {
      case "+":
        return String(add(a, b));
      case "-":
        return String(subtract(a, b));
      case "×":
        return String(multiply(a, b));
      case "^":
        return String(power(a, b));
      case "÷":
        // Handle a division by zero
        if (b === 0) {
          return "Error";
        }
        return String(divide(a, b));
    }
  }

  function add(a, b) {
    return a + b;
  }

  function subtract(a, b) {
    return a - b;
  }

  function multiply(a, b) {
    return a * b;
  }

  function divide(a, b) {
    return a / b;
  }

  function power(a, b) {
    return a ** b;
  }

  function addDecimal(pointEvent) {
    // When user start with "."
    if (operator.unsaved && first.unsaved && first.integer) {
      first.value = "0" + pointEvent;
      saveData(first, true);
    }
    // Handle negative number
    if (operator.unsaved && first.saved && first.integer) {
      if (first.value.startsWith("-")) {
        first.value += "0" + pointEvent;
        first.integer = false;
      } else {
        first.value += pointEvent;
        first.integer = false;
      }
    }
    if (operator.saved && second.unsaved && second.integer) {
      second.value = "0" + pointEvent;
      saveData(second, true);
    }
    if (operator.saved && second.saved && second.integer) {
      if (second.value.startsWith("-")) {
        second.value += "0" + pointEvent;
        second.integer = false;
      } else {
        second.value += pointEvent;
        second.integer = false;
      }
    }
  }

  function getOpposite() {
    // When a number consist only in a minus saved we want nothing to happen
    if (first.value === "-" || second.value === "-") {
      return;
    }
    // Allow to put decimal without any numbers after the point when called
    let target = second.saved ? second : first
    if (target.integer === false) {
      target.integer = true;
    }
    // Alternate +/- for the first number
    if (first.saved && operator.unsaved) {
      first.value *= -1;
      first.value = String(first.value);
    }
    // Alternate +/- for the second number
    if (operator.saved && second.saved) {
      second.value *= -1;
      second.value = String(second.value);
      // Handle a sign plus followed by a negative number
      if (operator.value === ("+") && second.value.startsWith("-")) {
        operator.value = "-";
        second.value = second.value.substring(1);
      }
      // Handle both negative sign and number
      if (operator.value === "-" && second.value.startsWith("-")) {
        operator.value = "+";
        second.value = second.value.substring(1);
      }
    }
  }

  function getPercentage() {
    let target = operator.unsaved ? first : second;
    if (target.value && target.value !== "-") {
      target.value = String(target.value / 100);
    }
  }

  function clearExpression() {
    allowNewNumber = false;
    if (first.saved && operator.unsaved && second.unsaved) {
      resetData(first);
    }
    if (first.saved && operator.saved && second.unsaved) {
      resetData(operator);
    }
    if (first.saved && operator.saved && second.saved) {
      resetData(second);
    }
    if (result) {
      result = "";
    }
  }

  function updateClearbutton(initText, updatedText) {
    const clearButton = document.querySelector("#ac");
    clearButton.textContent = updatedText;
    if (first.unsaved && operator.unsaved && second.unsaved) {
      clearButton.textContent = initText;
    }
  }

  function updateDisplay(first, sign, second, result) {
    const expressionDisplay = document.querySelector("#expression");
    const resultDisplay = document.querySelector("#result");
    if (result) {
      resultDisplay.textContent = roundNumber(result);
    } else {
      resultDisplay.textContent = "0";
    }
    if (first && first !== "-") {
      first = roundNumber(first);
    }
    if (second && second !== "-") {
      second = roundNumber(second);
    }
    expressionDisplay.textContent = `${first} ${sign} ${second}`;
  }

  function roundNumber(numberString) {
    let number = parseFloat(numberString);
    let isInteger = number % 1 === 0;
    let isFloat = number % 1 !== 0;
    if (isInteger && numberString.length > 6) {
      return number.toExponential(2);
    }
    if (isFloat) {
      let [leftPart, rightPart] = numberString.split(".");
      if (leftPart.length > 6) {
        return number.toExponential(2);
      }
      if (rightPart.length > 2) {
        return number.toFixed(2);
      }
    }
    return numberString;
  }

  function saveData(element, decimal = false) {
    element.unsaved = false;
    element.saved = true;
    if (decimal) {
      element.integer = false;
    }
  }

  function resetData(element) {
    for (let key in element) {
      switch (key) {
        case "value":
          element[key] = "";
          break;
        case "integer":
        case "unsaved":
          element[key] = true;
          break;
        case "saved":
          element[key] = false;
          break;
      }
    }
  }

}