class qTable {
    constructor(name = 'qTable', explorationRate = 0.1, discountFactor = 0.9, learningType = "max") {
        //initialize learning parameters
        this.table = {};
        this.explorationRate = explorationRate;
        this.discountFactor = discountFactor;
        this.name = name;
        
        //validate learningType
        if (learningType !== "min" && learningType !== "max") {
            throw new Error("Invalid learningType for qTable: " + learningType + ". Must be 'min' or 'max'.");
        } else {
            this.learningType = learningType;
        }
        
        //load or initialize table from localStorage
        if(localStorage.getItem(this.name)) {
            this.table = JSON.parse(localStorage.getItem(this.name));
        } else {
            localStorage.setItem(this.name, JSON.stringify(this.table));
        }
        
        //initialize state and action tracking for backpropagation
        this.lastState = null;
        this.lastAction = null;
    }

    save(state, action, reward = 0) {
        //validate state and action parameters
        if (!state || !action) {
            throw new Error("Invalid state or action for qTable.save: " + state + ", " + action);
        }
        
        //validate learningType
        if (this.learningType !== "min" && this.learningType !== "max") {
            throw new Error("Invalid learningType for qTable.save: " + this.learningType + ". Must be 'min' or 'max'.");
        }
        
        //initialize state and action entry if not exists
        this.table[state] = this.table[state] || {};
        this.table[state][action] = this.table[state][action] || {};
        this.table[state][action].value = this.table[state][action].value || 0;

        //apply immediate reward to the current state/action
        this.table[state][action].value += reward;

        //backpropagate the states to the previous state and action
        if (this.lastState !== null && this.lastAction !== null) {
            this.table[this.lastState][this.lastAction] = this.table[this.lastState][this.lastAction] || {};
            this.table[this.lastState][this.lastAction].possibleAfterStates = this.table[this.lastState][this.lastAction].possibleAfterStates || [];
            if (!this.table[this.lastState][this.lastAction].possibleAfterStates.includes(state)) {
                this.table[this.lastState][this.lastAction].possibleAfterStates.push(state);
            }

            //update the value of the previous state/action based on the current state's values
            this.table[this.lastState][this.lastAction].possibleAfterStates.forEach(afterState => {
                this.table[afterState] = this.table[afterState] || {};
                Object.keys(this.table[afterState]).forEach(afterAction => {
                    if (this.learningType === "max") {
                        this.table[this.lastState][this.lastAction].value = Math.max(this.table[this.lastState][this.lastAction].value, this.table[afterState][afterAction].value * this.discountFactor || 0);
                    } else if (this.learningType === "min") {
                        this.table[this.lastState][this.lastAction].value = Math.min(this.table[this.lastState][this.lastAction].value, this.table[afterState][afterAction].value * this.discountFactor || 0);
                    }
                });
            });
        }

        //save the table to localStorage
        localStorage.setItem(this.name, JSON.stringify(this.table));

        //save last state and action for the next save
        this.lastState = state;
        this.lastAction = action;
    }

    get(state, possibleActions, canExplore = false, forceLearning = false) {
        //normal mode: balance exploration or just return best action based on learned values
        if(!forceLearning) {
            //exploration: choose random action
            if(canExplore && Math.random() < this.explorationRate) {
                return possibleActions[Math.floor(Math.random() * possibleActions.length)];
            } else {
                //return best action based on learned values
                let bestAction = null;
                let bestValue = this.learningType === "max" ? -Infinity : Infinity;
                possibleActions.forEach(action => {
                    if (this.learningType === "max") {
                        if (this.table[state]?.[action]?.value > bestValue) {
                            bestValue = this.table[state][action].value;
                            bestAction = action;
                        }
                    } else if (this.learningType === "min") {
                        if (this.table[state]?.[action]?.value < bestValue) {
                            bestValue = this.table[state][action].value;
                            bestAction = action;
                        }
                    }
                });
                return bestAction;
            }
        } else {
            //forceLearning mode: prioritize unexplored actions
            let unexploredActions = [];
            possibleActions.forEach(action => {
                if (!this.table[state]?.[action]?.possibleAfterStates || this.table[state][action].possibleAfterStates.length === 0) {
                    unexploredActions.push(action);
                }
            });
            //return unexplored action if available, otherwise random action
            if (unexploredActions.length > 0) {
                return unexploredActions[Math.floor(Math.random() * unexploredActions.length)];
            } else {
                return possibleActions[Math.floor(Math.random() * possibleActions.length)];
            }
        }
    }
}
