class FantasyRPG {
    constructor() {
        this.gameState = {
            character: null,
            currentLocation: null,
            inventory: [],
            equipment: { weapon: null, armor: null, accessory: null },
            spells: [],
            companions: [],
            worldMap: new Map(),
            gameTime: { day: 1, hour: 8, period: 'Morning' },
            isInCombat: false,
            currentEnemy: null
        };
        
        this.settings = {
            ollamaUrl: 'http://localhost:11434',
            model: 'llama2',
            creativity: 0.8,
            autoSave: true
        };
        
        this.isConnected = false;
        this.currentScreen = 'character-creation';
        
        this.init();
    }

    init() {
        this.loadSettings();
        this.bindEvents();
        this.testConnection();
        this.generateInitialInventory();
        this.generateInitialSpells();
    }

    bindEvents() {
        // Character creation
        document.getElementById('start-game').addEventListener('click', () => {
            this.createCharacter();
        });

        // Main game actions
        document.getElementById('send-action').addEventListener('click', () => {
            this.processAction();
        });

        document.getElementById('action-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.processAction();
            }
        });

        // Quick actions
        document.querySelectorAll('.quick-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                document.getElementById('action-input').value = action;
                this.processAction();
            });
        });

        // Combat actions
        document.getElementById('attack-btn').addEventListener('click', () => {
            this.performCombatAction('attack');
        });

        document.getElementById('magic-btn').addEventListener('click', () => {
            this.performCombatAction('magic');
        });

        document.getElementById('defend-btn').addEventListener('click', () => {
            this.performCombatAction('defend');
        });

        document.getElementById('flee-btn').addEventListener('click', () => {
            this.performCombatAction('flee');
        });

        // Tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Settings
        document.getElementById('open-settings').addEventListener('click', () => {
            this.showModal('settings-panel');
        });

        document.getElementById('close-settings').addEventListener('click', () => {
            this.hideModal('settings-panel');
        });

        document.getElementById('save-settings').addEventListener('click', () => {
            this.saveSettings();
        });

        document.getElementById('creativity').addEventListener('input', (e) => {
            document.getElementById('creativity-value').textContent = e.target.value;
        });

        // Game management
        document.getElementById('save-game').addEventListener('click', () => {
            this.saveGame();
        });

        document.getElementById('load-game').addEventListener('click', () => {
            this.loadGame();
        });

        // NPC and monster interactions
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('npc-item')) {
                this.interactWithNPC(e.target.dataset.npcId);
            } else if (e.target.classList.contains('monster-item')) {
                this.startCombat(e.target.dataset.monsterId);
            }
        });
    }

    createCharacter() {
        const name = document.getElementById('char-name').value.trim();
        const charClass = document.getElementById('char-class').value;
        const gender = document.getElementById('char-gender').value;

        if (!name) {
            alert('Please enter a character name!');
            return;
        }

        const classStats = {
            warrior: { hp: 120, mp: 30, attack: 15, defense: 12, speed: 8, avatar: '⚔️' },
            mage: { hp: 80, mp: 100, attack: 8, defense: 6, speed: 10, avatar: '🔮' },
            rogue: { hp: 90, mp: 50, attack: 12, defense: 8, speed: 15, avatar: '🗡️' },
            paladin: { hp: 110, mp: 60, attack: 12, defense: 15, speed: 9, avatar: '🛡️' },
            necromancer: { hp: 85, mp: 90, attack: 10, defense: 7, speed: 11, avatar: '💀' }
        };

        this.gameState.character = {
            name: name,
            class: charClass,
            gender: gender,
            level: 1,
            xp: 0,
            xpToNext: 100,
            gold: 100,
            ...classStats[charClass],
            maxHp: classStats[charClass].hp,
            maxMp: classStats[charClass].mp
        };

        this.updateCharacterDisplay();
        this.switchScreen('game-interface');
        this.startGame();
    }

    async startGame() {
        // Generate starting location
        await this.generateLocation('Starting Village', true);
        this.addLogMessage('system', `Welcome to the fantasy world, ${this.gameState.character.name}! Your adventure begins in a peaceful village.`);
        
        // Generate initial world content
        await this.generateInitialWorld();
    }

    async generateLocation(locationName, isStarting = false) {
        const prompt = `Generate a fantasy RPG location called "${locationName}". ${isStarting ? 'This is the starting village where the player begins their adventure.' : 'This is a new location the player has discovered.'} 

        Provide:
        1. A detailed description of the location (2-3 sentences)
        2. Weather conditions
        3. 3-5 NPCs with names, brief descriptions, and personality traits
        4. 2-4 monsters/threats nearby with names, descriptions, and danger levels
        5. Notable features or points of interest

        Format as JSON:
        {
            "description": "location description",
            "weather": "weather emoji and description",
            "npcs": [{"name": "NPC Name", "description": "brief description", "personality": "personality traits", "relationship": 0}],
            "monsters": [{"name": "Monster Name", "description": "description", "level": 1, "hp": 50, "dangerLevel": "Low/Medium/High"}],
            "features": ["feature1", "feature2"]
        }`;

        try {
            const response = await this.callOllama(prompt);
            const locationData = this.parseJSONResponse(response);
            
            if (locationData) {
                this.gameState.currentLocation = {
                    name: locationName,
                    ...locationData,
                    visited: true
                };
                
                this.gameState.worldMap.set(locationName, this.gameState.currentLocation);
                this.updateLocationDisplay();
                this.populateNPCs();
                this.populateMonsters();
            }
        } catch (error) {
            console.error('Failed to generate location:', error);
            this.addLogMessage('system', 'Failed to generate location details. Using default content.');
            this.createDefaultLocation(locationName);
        }
    }

    createDefaultLocation(locationName) {
        this.gameState.currentLocation = {
            name: locationName,
            description: "A mysterious place shrouded in ancient magic and untold secrets.",
            weather: "☀️ Pleasant",
            npcs: [
                { name: "Village Elder", description: "A wise old man", personality: "Helpful and knowledgeable", relationship: 0 },
                { name: "Merchant", description: "A traveling trader", personality: "Greedy but fair", relationship: 0 }
            ],
            monsters: [
                { name: "Forest Wolf", description: "A wild wolf", level: 1, hp: 30, dangerLevel: "Low" }
            ],
            features: ["Ancient well", "Market square"],
            visited: true
        };
        
        this.gameState.worldMap.set(locationName, this.gameState.currentLocation);
        this.updateLocationDisplay();
        this.populateNPCs();
        this.populateMonsters();
    }

    async processAction() {
        const action = document.getElementById('action-input').value.trim();
        if (!action) return;

        document.getElementById('action-input').value = '';
        this.addLogMessage('player', action);

        // Check for special commands
        if (action.toLowerCase().includes('inventory') || action.toLowerCase().includes('check items')) {
            this.showInventory();
            return;
        }

        if (action.toLowerCase().includes('explore') || action.toLowerCase().includes('travel')) {
            await this.handleExploration(action);
            return;
        }

        if (action.toLowerCase().includes('talk to') || action.toLowerCase().includes('speak with')) {
            await this.handleNPCInteraction(action);
            return;
        }

        if (action.toLowerCase().includes('attack') || action.toLowerCase().includes('fight')) {
            await this.handleCombatInitiation(action);
            return;
        }

        // General AI response
        await this.getAIResponse(action);
        
        // Advance time
        this.advanceTime();
        
        // Auto-save if enabled
        if (this.settings.autoSave) {
            this.autoSave();
        }
    }

    async getAIResponse(action) {
        const context = this.buildGameContext();
        const prompt = `${context}

        Player action: "${action}"

        As the game master, respond to this action. Consider:
        - The current location and its features
        - NPCs and monsters present
        - Player's character class and abilities
        - Potential consequences and outcomes
        - Opportunities for character development

        Keep the response engaging and around 2-3 paragraphs. End with what the player sees or can do next.`;

        try {
            const response = await this.callOllama(prompt);
            this.addLogMessage('ai', response);
            
            // Check if the response mentions gaining items, XP, or gold
            this.parseRewards(response);
            
        } catch (error) {
            this.addLogMessage('system', 'The mystical forces seem to be disrupted. Please try again.');
        }
    }

    async handleExploration(action) {
        const prompt = `The player wants to explore or travel. Current location: ${this.gameState.currentLocation.name}. 
        
        Generate a new location name that the player discovers, or describe exploring the current area in more detail. 
        
        If generating a new location, respond with: "NEW_LOCATION: [Location Name]"
        Otherwise, provide a detailed exploration description.`;

        try {
            const response = await this.callOllama(prompt);
            
            if (response.includes('NEW_LOCATION:')) {
                const newLocationName = response.split('NEW_LOCATION:')[1].trim();
                await this.generateLocation(newLocationName);
                this.addLogMessage('ai', `You discover ${newLocationName}! A new area to explore.`);
            } else {
                this.addLogMessage('ai', response);
            }
        } catch (error) {
            this.addLogMessage('system', 'Your exploration is hindered by mysterious forces.');
        }
    }

    async handleNPCInteraction(action) {
        const npcName = this.extractNPCName(action);
        const npc = this.gameState.currentLocation.npcs.find(n => 
            n.name.toLowerCase().includes(npcName.toLowerCase()) || 
            npcName.toLowerCase().includes(n.name.toLowerCase())
        );

        if (!npc) {
            this.addLogMessage('ai', "There's no one by that name here.");
            return;
        }

        const prompt = `The player wants to interact with ${npc.name}. 
        NPC Details: ${npc.description}, Personality: ${npc.personality}, Relationship: ${npc.relationship}
        Player character: ${this.gameState.character.name} (${this.gameState.character.class})
        
        Generate a conversation response from ${npc.name}. Consider:
        - Their personality and current relationship with the player
        - Potential romance options if appropriate
        - Information they might share about the world
        - Quests or opportunities they might offer
        - Their reaction to the player's class and actions
        
        Include dialogue and describe their demeanor.`;

        try {
            const response = await this.callOllama(prompt);
            this.addLogMessage('ai', response);
            
            // Potentially improve relationship
            if (Math.random() < 0.3) {
                npc.relationship += 1;
                this.addLogMessage('system', `Your relationship with ${npc.name} has improved.`);
            }
        } catch (error) {
            this.addLogMessage('system', `${npc.name} seems distracted and doesn't respond.`);
        }
    }

    async handleCombatInitiation(action) {
        const monsterName = this.extractMonsterName(action);
        const monster = this.gameState.currentLocation.monsters.find(m => 
            m.name.toLowerCase().includes(monsterName.toLowerCase()) || 
            monsterName.toLowerCase().includes(m.name.toLowerCase())
        );

        if (!monster) {
            this.addLogMessage('ai', "There's no such threat here to fight.");
            return;
        }

        this.startCombat(monster);
    }

    startCombat(monster) {
        this.gameState.isInCombat = true;
        this.gameState.currentEnemy = { ...monster, currentHp: monster.hp };
        
        this.switchScreen('combat-interface');
        this.updateCombatDisplay();
        this.addCombatMessage(`Combat begins with ${monster.name}!`);
    }

    async performCombatAction(actionType) {
        if (!this.gameState.isInCombat || !this.gameState.currentEnemy) return;

        const enemy = this.gameState.currentEnemy;
        const player = this.gameState.character;

        let playerDamage = 0;
        let playerMessage = '';

        switch (actionType) {
            case 'attack':
                playerDamage = Math.floor(player.attack + Math.random() * 10);
                playerMessage = `You attack ${enemy.name} for ${playerDamage} damage!`;
                break;
            
            case 'magic':
                if (player.mp >= 10) {
                    playerDamage = Math.floor(player.attack * 1.5 + Math.random() * 15);
                    player.mp -= 10;
                    playerMessage = `You cast a spell on ${enemy.name} for ${playerDamage} damage!`;
                } else {
                    playerMessage = "Not enough mana to cast a spell!";
                }
                break;
            
            case 'defend':
                player.hp = Math.min(player.maxHp, player.hp + 5);
                playerMessage = "You defend and recover 5 HP!";
                break;
            
            case 'flee':
                if (Math.random() < 0.7) {
                    this.endCombat(false);
                    this.addLogMessage('combat', "You successfully flee from combat!");
                    return;
                } else {
                    playerMessage = "Failed to flee!";
                }
                break;
        }

        this.addCombatMessage(playerMessage);
        enemy.currentHp -= playerDamage;

        // Check if enemy is defeated
        if (enemy.currentHp <= 0) {
            this.endCombat(true);
            return;
        }

        // Enemy turn
        const enemyDamage = Math.floor(enemy.level * 8 + Math.random() * 10);
        player.hp -= Math.max(1, enemyDamage - player.defense);
        this.addCombatMessage(`${enemy.name} attacks you for ${Math.max(1, enemyDamage - player.defense)} damage!`);

        // Check if player is defeated
        if (player.hp <= 0) {
            this.gameOver();
            return;
        }

        this.updateCombatDisplay();
        this.updateCharacterDisplay();
    }

    endCombat(victory) {
        this.gameState.isInCombat = false;
        
        if (victory) {
            const enemy = this.gameState.currentEnemy;
            const xpGain = enemy.level * 25;
            const goldGain = enemy.level * 10 + Math.floor(Math.random() * 20);
            
            this.gameState.character.xp += xpGain;
            this.gameState.character.gold += goldGain;
            
            this.addLogMessage('combat', `Victory! You gained ${xpGain} XP and ${goldGain} gold.`);
            
            // Remove defeated monster from location
            const monsterIndex = this.gameState.currentLocation.monsters.findIndex(m => m.name === enemy.name);
            if (monsterIndex > -1) {
                this.gameState.currentLocation.monsters.splice(monsterIndex, 1);
            }
            
            // Check for level up
            this.checkLevelUp();
            
            // Generate loot
            this.generateLoot(enemy.level);
        }
        
        this.gameState.currentEnemy = null;
        this.switchScreen('game-interface');
        this.updateCharacterDisplay();
        this.populateMonsters();
    }

    checkLevelUp() {
        const character = this.gameState.character;
        if (character.xp >= character.xpToNext) {
            character.level++;
            character.xp -= character.xpToNext;
            character.xpToNext = character.level * 100;
            
            // Stat increases
            character.maxHp += 10;
            character.maxMp += 5;
            character.hp = character.maxHp; // Full heal on level up
            character.mp = character.maxMp;
            character.attack += 2;
            character.defense += 1;
            
            this.addLogMessage('system', `🎉 Level Up! You are now level ${character.level}!`);
            this.updateCharacterDisplay();
        }
    }

    async generateLoot(enemyLevel) {
        const prompt = `Generate loot for defeating a level ${enemyLevel} enemy in a fantasy RPG. 
        
        Provide 1-3 items with:
        - Item name
        - Type (weapon, armor, accessory, consumable, misc)
        - Description
        - Stats/effects if applicable
        
        Format as JSON array: [{"name": "item name", "type": "item type", "description": "description", "stats": "stat bonuses"}]`;

        try {
            const response = await this.callOllama(prompt);
            const loot = this.parseJSONResponse(response);
            
            if (loot && Array.isArray(loot)) {
                loot.forEach(item => {
                    this.gameState.inventory.push(item);
                    this.addLogMessage('system', `Found: ${item.name}`);
                });
                this.updateInventoryDisplay();
            }
        } catch (error) {
            // Default loot
            const defaultLoot = {
                name: "Gold Coins",
                type: "misc",
                description: "Shiny gold coins",
                stats: ""
            };
            this.gameState.inventory.push(defaultLoot);
            this.addLogMessage('system', "Found: Gold Coins");
        }
    }

    gameOver() {
        this.addLogMessage('system', '💀 Game Over! Your adventure ends here...');
        setTimeout(() => {
            if (confirm('Game Over! Would you like to start a new character?')) {
                this.resetGame();
            }
        }, 2000);
    }

    resetGame() {
        this.gameState = {
            character: null,
            currentLocation: null,
            inventory: [],
            equipment: { weapon: null, armor: null, accessory: null },
            spells: [],
            companions: [],
            worldMap: new Map(),
            gameTime: { day: 1, hour: 8, period: 'Morning' },
            isInCombat: false,
            currentEnemy: null
        };
        
        this.switchScreen('character-creation');
        document.getElementById('game-log').innerHTML = '';
        document.getElementById('char-name').value = '';
    }

    generateInitialInventory() {
        this.gameState.inventory = [
            { name: "Health Potion", type: "consumable", description: "Restores 50 HP", stats: "+50 HP" },
            { name: "Mana Potion", type: "consumable", description: "Restores 30 MP", stats: "+30 MP" },
            { name: "Iron Sword", type: "weapon", description: "A sturdy iron blade", stats: "+5 Attack" },
            { name: "Leather Armor", type: "armor", description: "Basic protection", stats: "+3 Defense" }
        ];
    }

    generateInitialSpells() {
        this.gameState.spells = [
            { name: "Heal", cost: 15, description: "Restore health to yourself", effect: "heal" },
            { name: "Fireball", cost: 20, description: "Launch a ball of fire at enemies", effect: "damage" },
            { name: "Shield", cost: 10, description: "Increase defense temporarily", effect: "buff" }
        ];
    }

    async generateInitialWorld() {
        // Generate some nearby locations
        const nearbyLocations = ["Dark Forest", "Ancient Ruins", "Mountain Pass", "Riverside Town"];
        
        for (const location of nearbyLocations.slice(0, 2)) {
            await this.generateLocation(location);
        }
    }

    buildGameContext() {
        const character = this.gameState.character;
        const location = this.gameState.currentLocation;
        
        return `You are the game master for a fantasy RPG. 

        Player Character: ${character.name}, Level ${character.level} ${character.class}
        Stats: HP ${character.hp}/${character.maxHp}, MP ${character.mp}/${character.maxMp}, Gold: ${character.gold}
        
        Current Location: ${location.name}
        Description: ${location.description}
        Weather: ${location.weather}
        
        NPCs present: ${location.npcs.map(npc => `${npc.name} (${npc.description})`).join(', ')}
        Monsters nearby: ${location.monsters.map(m => `${m.name} (Level ${m.level})`).join(', ')}
        
        Game Time: Day ${this.gameState.gameTime.day}, ${this.gameState.gameTime.period}
        
        Create immersive fantasy scenarios with opportunities for:
        - Combat with monsters
        - Social interactions with NPCs (including romance/relationships)
        - Exploration and discovery
        - Character progression
        - Moral choices and consequences`;
    }

    parseJSONResponse(response) {
        try {
            // Try to extract JSON from the response
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            
            // Try to extract array
            const arrayMatch = response.match(/\[[\s\S]*\]/);
            if (arrayMatch) {
                return JSON.parse(arrayMatch[0]);
            }
            
            return null;
        } catch (error) {
            console.error('Failed to parse JSON:', error);
            return null;
        }
    }

    parseRewards(response) {
        // Check for XP gains
        const xpMatch = response.match(/(\d+)\s*(?:xp|experience)/i);
        if (xpMatch) {
            const xpGain = parseInt(xpMatch[1]);
            this.gameState.character.xp += xpGain;
            this.addLogMessage('system', `Gained ${xpGain} XP!`);
            this.checkLevelUp();
        }

        // Check for gold gains
        const goldMatch = response.match(/(\d+)\s*(?:gold|coins?)/i);
        if (goldMatch) {
            const goldGain = parseInt(goldMatch[1]);
            this.gameState.character.gold += goldGain;
            this.addLogMessage('system', `Found ${goldGain} gold!`);
        }

        this.updateCharacterDisplay();
    }

    extractNPCName(action) {
        const words = action.toLowerCase().split(' ');
        const talkIndex = words.findIndex(word => word.includes('talk') || word.includes('speak'));
        if (talkIndex > -1 && talkIndex < words.length - 1) {
            return words.slice(talkIndex + 1).join(' ').replace(/^(to|with)\s+/, '');
        }
        return '';
    }

    extractMonsterName(action) {
        const words = action.toLowerCase().split(' ');
        const attackIndex = words.findIndex(word => word.includes('attack') || word.includes('fight'));
        if (attackIndex > -1 && attackIndex < words.length - 1) {
            return words.slice(attackIndex + 1).join(' ');
        }
        return '';
    }

    advanceTime() {
        this.gameState.gameTime.hour += 1;
        if (this.gameState.gameTime.hour >= 24) {
            this.gameState.gameTime.hour = 0;
            this.gameState.gameTime.day += 1;
        }

        // Update period
        if (this.gameState.gameTime.hour < 6) {
            this.gameState.gameTime.period = 'Night';
        } else if (this.gameState.gameTime.hour < 12) {
            this.gameState.gameTime.period = 'Morning';
        } else if (this.gameState.gameTime.hour < 18) {
            this.gameState.gameTime.period = 'Afternoon';
        } else {
            this.gameState.gameTime.period = 'Evening';
        }

        this.updateTimeDisplay();
    }

    // UI Update Methods
    updateCharacterDisplay() {
        const character = this.gameState.character;
        if (!character) return;

        document.getElementById('char-name-display').textContent = character.name;
        document.getElementById('char-level').textContent = `Level ${character.level}`;
        document.getElementById('char-avatar').textContent = character.avatar;
        
        // Update stat bars
        this.updateStatBar('hp', character.hp, character.maxHp);
        this.updateStatBar('mp', character.mp, character.maxMp);
        this.updateStatBar('xp', character.xp, character.xpToNext);
        
        document.getElementById('gold').textContent = character.gold;
    }

    updateStatBar(stat, current, max) {
        const percentage = (current / max) * 100;
        document.getElementById(`${stat}-fill`).style.width = `${percentage}%`;
        document.getElementById(`${stat}-text`).textContent = `${current}/${max}`;
    }

    updateLocationDisplay() {
        const location = this.gameState.currentLocation;
        if (!location) return;

        document.getElementById('current-location').textContent = location.name;
        document.getElementById('location').textContent = location.name;
        document.getElementById('location-description').textContent = location.description;
        document.querySelector('.weather').textContent = location.weather;
    }

    updateTimeDisplay() {
        const time = this.gameState.gameTime;
        document.getElementById('game-time').textContent = `Day ${time.day}, ${time.period}`;
    }

    populateNPCs() {
        const npcList = document.getElementById('npc-list');
        npcList.innerHTML = '';

        this.gameState.currentLocation.npcs.forEach((npc, index) => {
            const npcElement = document.createElement('div');
            npcElement.className = 'npc-item';
            npcElement.dataset.npcId = index;
            npcElement.innerHTML = `
                <div style="font-weight: bold;">${npc.name}</div>
                <div style="font-size: 0.9em; opacity: 0.8;">${npc.description}</div>
                <div style="font-size: 0.8em; color: #ff69b4;">❤️ ${npc.relationship}</div>
            `;
            npcList.appendChild(npcElement);
        });
    }

    populateMonsters() {
        const monsterList = document.getElementById('monster-list');
        monsterList.innerHTML = '';

        this.gameState.currentLocation.monsters.forEach((monster, index) => {
            const monsterElement = document.createElement('div');
            monsterElement.className = 'monster-item';
            monsterElement.dataset.monsterId = index;
            monsterElement.innerHTML = `
                <div style="font-weight: bold;">${monster.name}</div>
                <div style="font-size: 0.9em; opacity: 0.8;">Level ${monster.level} - ${monster.dangerLevel}</div>
                <div style="font-size: 0.8em; color: #ff4444;">HP: ${monster.hp}</div>
            `;
            monsterList.appendChild(monsterElement);
        });
    }

    updateInventoryDisplay() {
        const inventoryGrid = document.getElementById('inventory-grid');
        inventoryGrid.innerHTML = '';

        // Create 20 inventory slots
        for (let i = 0; i < 20; i++) {
            const slot = document.createElement('div');
            slot.className = 'inventory-slot';
            
            if (i < this.gameState.inventory.length) {
                const item = this.gameState.inventory[i];
                slot.classList.add('occupied');
                slot.textContent = this.getItemIcon(item.type);
                slot.title = `${item.name}\n${item.description}`;
            }
            
            inventoryGrid.appendChild(slot);
        }
    }

    updateCombatDisplay() {
        const enemy = this.gameState.currentEnemy;
        if (!enemy) return;

        document.getElementById('enemy-name').textContent = enemy.name;
        document.getElementById('enemy-image').textContent = this.getMonsterIcon(enemy.name);
        document.getElementById('enemy-level').textContent = `Level ${enemy.level}`;
        
        const percentage = (enemy.currentHp / enemy.hp) * 100;
        document.getElementById('enemy-hp-fill').style.width = `${percentage}%`;
        document.getElementById('enemy-hp-text').textContent = `${enemy.currentHp}/${enemy.hp}`;
    }

    getItemIcon(type) {
        const icons = {
            weapon: '⚔️',
            armor: '🛡️',
            accessory: '💍',
            consumable: '🧪',
            misc: '📦'
        };
        return icons[type] || '📦';
    }

    getMonsterIcon(name) {
        const icons = {
            wolf: '🐺',
            goblin: '👹',
            orc: '👹',
            dragon: '🐉',
            skeleton: '💀',
            spider: '🕷️',
            troll: '👹'
        };
        
        for (const [key, icon] of Object.entries(icons)) {
            if (name.toLowerCase().includes(key)) {
                return icon;
            }
        }
        return '👹';
    }

    showInventory() {
        this.switchTab('inventory');
        this.updateInventoryDisplay();
        this.addLogMessage('system', 'You check your inventory.');
    }

    // UI Helper Methods
    switchScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.add('hidden');
        });
        document.getElementById(screenId).classList.remove('hidden');
        this.currentScreen = screenId;
    }

    switchTab(tabId) {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
        document.getElementById(`${tabId}-tab`).classList.add('active');
    }

    showModal(modalId) {
        document.getElementById(modalId).classList.remove('hidden');
    }

    hideModal(modalId) {
        document.getElementById(modalId).classList.add('hidden');
    }

    addLogMessage(type, message) {
        const gameLog = document.getElementById('game-log');
        const messageDiv = document.createElement('div');
        messageDiv.className = `log-message ${type}`;
        messageDiv.textContent = message;
        
        gameLog.appendChild(messageDiv);
        gameLog.scrollTop = gameLog.scrollHeight;
    }

    addCombatMessage(message) {
        const combatLog = document.getElementById('combat-log');
        const messageDiv = document.createElement('div');
        messageDiv.textContent = message;
        
        combatLog.appendChild(messageDiv);
        combatLog.scrollTop = combatLog.scrollHeight;
    }

    // NPC Interaction Methods
    async interactWithNPC(npcId) {
        const npc = this.gameState.currentLocation.npcs[npcId];
        if (!npc) return;

        const prompt = `The player clicks on ${npc.name} to interact. 
        NPC Details: ${npc.description}, Personality: ${npc.personality}, Relationship: ${npc.relationship}
        Player: ${this.gameState.character.name} (${this.gameState.character.class})
        
        Generate an interaction. Consider:
        - Their current relationship level
        - Potential romance/flirting opportunities
        - Information about the world or quests
        - Their personality and how they'd react
        - Opportunities for relationship building
        
        Include dialogue and actions.`;

        try {
            const response = await this.callOllama(prompt);
            this.addLogMessage('ai', response);
            
            // Improve relationship
            npc.relationship += 1;
            this.populateNPCs();
        } catch (error) {
            this.addLogMessage('system', `${npc.name} is busy right now.`);
        }
    }

    // Ollama Integration
    async callOllama(prompt) {
        if (!this.isConnected) {
            throw new Error('Not connected to Ollama');
        }

        const response = await fetch(`${this.settings.ollamaUrl}/api/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: this.settings.model,
                prompt: prompt,
                stream: false,
                options: {
                    temperature: this.settings.creativity,
                    top_p: 0.9,
                    max_tokens: 400
                }
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.response;
    }

    async testConnection() {
        try {
            const response = await fetch(`${this.settings.ollamaUrl}/api/tags`);
            if (response.ok) {
                this.isConnected = true;
                document.getElementById('connection-status').innerHTML = '🟢 Connected';
                
                const data = await response.json();
                this.updateModelList(data.models);
            } else {
                throw new Error('Connection failed');
            }
        } catch (error) {
            this.isConnected = false;
            document.getElementById('connection-status').innerHTML = '🔴 Disconnected';
        }
    }

    updateModelList(models) {
        const modelSelect = document.getElementById('ai-model');
        modelSelect.innerHTML = '';
        
        models.forEach(model => {
            const option = document.createElement('option');
            option.value = model.name;
            option.textContent = model.name;
            if (model.name === this.settings.model) {
                option.selected = true;
            }
            modelSelect.appendChild(option);
        });
    }

    // Settings Management
    saveSettings() {
        this.settings.ollamaUrl = document.getElementById('ollama-url').value;
        this.settings.model = document.getElementById('ai-model').value;
        this.settings.creativity = parseFloat(document.getElementById('creativity').value);
        this.settings.autoSave = document.getElementById('auto-save').checked;
        
        localStorage.setItem('fantasy-rpg-settings', JSON.stringify(this.settings));
        this.testConnection();
        
        this.addLogMessage('system', 'Settings saved successfully!');
        this.hideModal('settings-panel');
    }

    loadSettings() {
        const saved = localStorage.getItem('fantasy-rpg-settings');
        if (saved) {
            this.settings = { ...this.settings, ...JSON.parse(saved) };
        }
        
        // Update UI
        document.getElementById('ollama-url').value = this.settings.ollamaUrl;
        document.getElementById('ai-model').value = this.settings.model;
        document.getElementById('creativity').value = this.settings.creativity;
        document.getElementById('creativity-value').textContent = this.settings.creativity;
        document.getElementById('auto-save').checked = this.settings.autoSave;
    }

    // Game Save/Load
    saveGame() {
        const gameData = {
            gameState: this.gameState,
            settings: this.settings,
            timestamp: new Date().toISOString()
        };
        
        // Convert Map to object for JSON serialization
        gameData.gameState.worldMapData = Object.fromEntries(this.gameState.worldMap);
        
        localStorage.setItem('fantasy-rpg-save', JSON.stringify(gameData));
        this.addLogMessage('system', '💾 Game saved successfully!');
    }

    loadGame() {
        const saved = localStorage.getItem('fantasy-rpg-save');
        if (!saved) {
            alert('No saved game found.');
            return;
        }
        
        try {
            const gameData = JSON.parse(saved);
            this.gameState = gameData.gameState;
            
            // Restore Map from object
            this.gameState.worldMap = new Map(Object.entries(gameData.gameState.worldMapData || {}));
            delete this.gameState.worldMapData;
            
            // Update all displays
            this.updateCharacterDisplay();
            this.updateLocationDisplay();
            this.updateTimeDisplay();
            this.populateNPCs();
            this.populateMonsters();
            this.updateInventoryDisplay();
            
            this.switchScreen('game-interface');
            this.addLogMessage('system', '📁 Game loaded successfully!');
            
        } catch (error) {
            alert('Failed to load game. Save file may be corrupted.');
        }
    }

    autoSave() {
        if (this.gameState.character && this.gameState.currentLocation) {
            this.saveGame();
        }
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new FantasyRPG();
});
