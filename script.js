const screen = document.getElementById('screen');
const buttons = document.querySelectorAll('.btn');

let expression = "";

// Map visual operators to math operators and vice versa
const operatorsMap = {
    '÷': '/',
    '×': '*',
    '/': '÷',
    '*': '×'
};

buttons.forEach(button => {
    button.addEventListener('click', function(e) {
        addRippleEffect(e, this);
        const value = this.getAttribute('data-value');
        handleInput(value);
    });
});

// Support keyboard input
document.addEventListener('keydown', (e) => {
    let key = e.key;
    if (/[0-9]/.test(key) || ['+', '-', '*', '/', '.', 'Enter', 'Backspace', 'Escape'].includes(key)) {
        e.preventDefault();
        
        // Trigger visual press effect on respective button
        let btnVal = key;
        if (key === 'Enter') btnVal = '=';
        else if (key === 'Backspace') btnVal = 'DE';
        else if (key === 'Escape') btnVal = 'AC';
        
        const btn = document.querySelector(`.btn[data-value="${btnVal}"]`);
        if(btn) {
            btn.classList.add('active'); // Simulate active state briefly
            setTimeout(() => btn.classList.remove('active'), 100);
        }

        handleInput(btnVal);
    }
});

function handleInput(value) {
    if (value === 'AC') {
        expression = "";
        updateScreen("");
        return;
    }

    if (value === 'DE') {
        expression = expression.toString().slice(0, -1);
        updateScreen(expression);
        return;
    }

    if (value === '=') {
        try {
            if (expression === "") return;
            
            // Prevent evaluation if ending with an operator
            if (['+', '-', '*', '/', '.'].includes(expression.slice(-1))) {
                expression = expression.slice(0, -1);
            }
            
            // Evaluate securely
            const result = new Function('return ' + expression)();
            
            // Handle divide by zero or math errors
            if (!isFinite(result)) {
                updateScreen("Error");
                expression = "";
                return;
            }

            // Fix floating point precision issues (e.g. 0.1 + 0.2)
            const finalResult = Math.round(result * 10000000000) / 10000000000;
            updateScreen(finalResult);
            expression = finalResult.toString();
        } catch (error) {
            updateScreen("Error");
            expression = "";
        }
        return;
    }

    // Prevent consecutive operators
    const lastChar = expression.slice(-1);
    const operators = ['+', '-', '*', '/', '.'];
    
    if (operators.includes(value)) {
        if (expression === "" && value !== '.') return; // Don't start with operator except .
        
        if (operators.includes(lastChar)) {
            // Replace the last operator with the new one
            expression = expression.slice(0, -1) + value;
            updateScreen(expression);
            return;
        }
    }

    expression += value;
    updateScreen(expression);
}

// Format the display to use visual operators (e.g. ÷ instead of /)
function updateScreen(value) {
    if (value === "Error") {
        screen.value = value;
        return;
    }
    
    let displayValue = value.toString();
    // Replace logic operators with visual ones for the screen
    displayValue = displayValue.replace(/\//g, '÷').replace(/\*/g, '×');
    
    screen.value = displayValue || "";
}

// Add smooth ripple effect function
function addRippleEffect(e, button) {
    const ripple = document.createElement('span');
    ripple.classList.add('ripple');
    
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    
    ripple.style.width = ripple.style.height = `${size}px`;
    
    // Calculate click position relative to button
    let x, y;
    if (e.clientX !== undefined) {
        x = e.clientX - rect.left - size / 2;
        y = e.clientY - rect.top - size / 2;
    } else {
        // Fallback for centered ripple (e.g. triggered by keyboard)
        x = rect.width / 2 - size / 2;
        y = rect.height / 2 - size / 2;
    }
    
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    
    button.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}
