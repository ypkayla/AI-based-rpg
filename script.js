class FantasyRPGGame {
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
            currentEnemy: null,
            playerPosition: { x: 400, y: 300 },
            mapEntities: []
        };
        
        this.settings = {
            ollamaUrl: 'http://localhost:11434',
            model: 'llava:13b',
            creativity: 0.8,
            autoSave: true,
            movementSpeed: 3
        };
        
        this.isConnected = false;
        this.currentScreen = 'character-creation';
        this.canvas = null;
        this.ctx = null;
        this.worldMapCanvas = null;
        this.worldMapCtx = null;
        this.keys = {};
        this.selectedItem = null;
        this.nearbyEntity = null;
        
        this.init();
    }

    init() {
        this.loadSettings();
        this.setupCanvas();
        this.bindEvents();
        this.testConnection();
        this.generateInitialInventory();
        this.generateInitialSpells();
        this.startGameLoop();
    }

    setupCanvas() {
        // Wait for DOM to be ready
        setTimeout(() => {
            this.canvas = document.getElementById('game-map');
            if (this.canvas) {
                this.ctx = this.canvas.getContext('2d');
                this.resizeCanvas();
                window.addEventListener('resize', () => this.resizeCanvas());
            }
            
            this.worldMapCanvas = document.getElementById('world-map-canvas');
            if (this.worldMapCanvas) {
                this.worldMapCtx = this.worldMapCanvas.getContext('2d');
            }
        }, 100);
    }

    resizeCanvas() {
        if (!this.canvas) return;
        const container = this.canvas.parentElement;
        if (container) {
            this.canvas.width = container.clientWidth;
            this.canvas.height = container.clientHeight;
        } else {
            // Fallback size
            this.canvas.width = 800;
            this.canvas.height = 400;
        }
    }

    bindEvents() {
        // Character creation
        document.getElementById('start-game').addEventListener('click', () => {
            this.createCharacter();
        });

        // Character class preview
        document.getElementById('char-class').addEventListener('change', (e) => {
            this.updateCharacterPreview(e.target.value);
        });

        // Movement controls
        document.getElementById('move-up').addEventListener('click', () => this.movePlayer(0, -1));
        document.getElementById('move-down').addEventListener('click', () => this.movePlayer(0, 1));
        document.getElementById('move-left').addEventListener('click', () => this.movePlayer(-1, 0));
        document.getElementById('move-right').addEventListener('click', () => this.movePlayer(1, 0));
        document.getElementById('interact-btn').addEventListener('click', () => this.interact());

        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            
            switch(e.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    e.preventDefault();
                    this.movePlayer(0, -1);
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    e.preventDefault();
                    this.movePlayer(0, 1);
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    e.preventDefault();
                    this.movePlayer(-1, 0);
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    e.preventDefault();
                    this.movePlayer(1, 0);
                    break;
                case ' ':
                    e.preventDefault();
                    this.interact();
                    break;
                case 'i':
                case 'I':
                    e.preventDefault();
                    this.showModal('inventory-modal');
                    break;
                case 'Escape':
                    this.hideAllModals();
                    break;
            }
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });

        // HUD buttons
        document.getElementById('inventory-btn').addEventListener('click', () => {
            this.showModal('inventory-modal');
            this.updateInventoryDisplay();
        });

        document.getElementById('spells-btn').addEventListener('click', () => {
            this.showModal('spells-modal');
            this.updateSpellsDisplay();
        });

        document.getElementById('map-btn').addEventListener('click', () => {
            this.showModal('world-map-modal');
            this.drawWorldMap();
        });

        document.getElementById('settings-btn').addEventListener('click', () => {
            this.showModal('settings-modal');
        });

        // Modal close buttons
        document.querySelectorAll('.close-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                this.hideModal(modal.id);
            });
        });

        // Chat functionality
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

        // Settings
        document.getElementById('save-settings').addEventListener('click', () => {
            this.saveSettings();
        });

        document.getElementById('creativity').addEventListener('input', (e) => {
            document.getElementById('creativity-value').textContent = e.target.value;
        });

        document.getElementById('movement-speed').addEventListener('input', (e) => {
            document.getElementById('speed-value').textContent = e.target.value;
        });

        // Item actions
        document.getElementById('use-item-btn').addEventListener('click', () => {
            this.useItem(this.selectedItem);
        });

        document.getElementById('equip-item-btn').addEventListener('click', () => {
            this.equipItem(this.selectedItem);
        });

        document.getElementById('drop-item-btn').addEventListener('click', () => {
            this.dropItem(this.selectedItem);
        });

        // Canvas click for interaction - delay setup until canvas is ready
        setTimeout(() => {
            if (this.canvas) {
                this.canvas.addEventListener('click', (e) => {
                    const rect = this.canvas.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    this.handleCanvasClick(x, y);
                });
            }
        }, 200);
    }

    updateCharacterPreview(charClass) {
        const avatars = {
            warrior: '⚔️',
            mage: '🔮',
            rogue: '🗡️',
            paladin: '🛡️',
            necromancer: '💀'
        };
        document.getElementById('char-preview-avatar').textContent = avatars[charClass];
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
        // Ensure canvas is ready
        if (!this.canvas) {
            setTimeout(() => this.startGame(), 100);
            return;
        }

        // Generate starting location
        await this.generateLocation('Elderbrook Village', true);
        this.addChatMessage('system', `Welcome to the fantasy realm, ${this.gameState.character.name}! Your adventure begins in the peaceful village of Elderbrook.`);
        
        // Generate initial world content
        await this.generateInitialWorld();
        
        // Force initial render
        this.render();
    }

    async generateLocation(locationName, isStarting = false) {
        try {
            const response = await this.callOllama(`Generate a fantasy RPG location called "${locationName}".`);
            // For now, just use default location
            this.createDefaultLocation(locationName);
        } catch (error) {
            console.error('Failed to generate location:', error);
            this.createDefaultLocation(locationName);
        }
    }

    createDefaultLocation(locationName) {
        this.gameState.currentLocation = {
            name: locationName,
            description: "A charming village nestled between rolling hills and ancient forests, where cobblestone paths wind between cozy cottages.",
            weather: "☀️ Pleasant sunny day",
            npcs: [
                { name: "Elder Mara", description: "A wise elderly woman with silver hair", personality: "Kind and knowledgeable", gender: "female", relationship: 0, dialogue: "Welcome, young traveler!" },
                { name: "Blacksmith Gareth", description: "A burly man with strong arms", personality: "Gruff but helpful", gender: "male", relationship: 0, dialogue: "Need any weapons forged?" },
                { name: "Innkeeper Sarah", description: "A cheerful middle-aged woman", personality: "Warm and hospitable", gender: "female", relationship: 0, dialogue: "Come in for a warm meal!" },
                { name: "Guard Captain Tom", description: "A stern man in leather armor", personality: "Dutiful and protective", gender: "male", relationship: 0, dialogue: "Stay safe out there." }
            ],
            monsters: [
                { name: "Forest Wolf", description: "A wild wolf from the nearby woods", level: 1, hp: 30, dangerLevel: "Low" },
                { name: "Goblin Scout", description: "A sneaky green creature", level: 2, hp: 25, dangerLevel: "Low" }
            ],
            features: ["Ancient well", "Market square", "Village shrine"],
            mapLayout: {
                buildings: ["Inn", "Blacksmith", "Market", "Houses"],
                naturalFeatures: ["River", "Forest edge", "Hills"],
                paths: ["Main road", "Forest path", "River crossing"]
            },
            visited: true
        };
        
        this.gameState.worldMap.set(locationName, this.gameState.currentLocation);
        this.updateLocationDisplay();
        this.generateMapEntities();
    }

    generateMapEntities() {
        this.gameState.mapEntities = [];
        const location = this.gameState.currentLocation;
        
        if (!location) return;

        // Add NPCs to map
        location.npcs.forEach((npc, index) => {
            this.gameState.mapEntities.push({
                type: 'npc',
                id: index,
                name: npc.name,
                x: 150 + (index * 120) + Math.random() * 50,
                y: 200 + Math.random() * 100,
                sprite: npc.gender === 'female' ? '👩' : '👨',
                data: npc
            });
        });

        // Add monsters to map
        location.monsters.forEach((monster, index) => {
            this.gameState.mapEntities.push({
                type: 'monster',
                id: index,
                name: monster.name,
                x: 500 + (index * 80) + Math.random() * 100,
                y: 400 + Math.random() * 80,
                sprite: this.getMonsterSprite(monster.name),
                data: monster
            });
        });

        // Add buildings
        if (location.mapLayout && location.mapLayout.buildings) {
            location.mapLayout.buildings.forEach((building, index) => {
                this.gameState.mapEntities.push({
                    type: 'building',
                    id: index,
                    name: building,
                    x: 100 + (index * 150),
                    y: 100,
                    sprite: this.getBuildingSprite(building),
                    data: { name: building }
                });
            });
        }

        // Add natural features
        if (location.mapLayout && location.mapLayout.naturalFeatures) {
            location.mapLayout.naturalFeatures.forEach((feature, index) => {
                this.gameState.mapEntities.push({
                    type: 'feature',
                    id: index,
                    name: feature,
                    x: 200 + (index * 200) + Math.random() * 100,
                    y: 450 + Math.random() * 50,
                    sprite: this.getFeatureSprite(feature),
                    data: { name: feature }
                });
            });
        }

        console.log('Generated entities:', this.gameState.mapEntities.length);
    }

    getMonsterSprite(name) {
        const sprites = {
            wolf: '🐺', goblin: '👹', orc: '👹', dragon: '🐉',
            skeleton: '💀', spider: '🕷️', troll: '👹', slime: '🟢'
        };
        
        for (const [key, sprite] of Object.entries(sprites)) {
            if (name.toLowerCase().includes(key)) {
                return sprite;
            }
        }
        return '👹';
    }

    getBuildingSprite(building) {
        const sprites = {
            inn: '🏨', blacksmith: '🔨', market: '🏪', house: '🏠',
            shop: '🏪', tavern: '🍺', temple: '⛪', tower: '🗼'
        };
        
        for (const [key, sprite] of Object.entries(sprites)) {
            if (building.toLowerCase().includes(key)) {
                return sprite;
            }
        }
        return '🏠';
    }

    getFeatureSprite(feature) {
        const sprites = {
            river: '🌊', forest: '🌲', mountain: '⛰️', hill: '🏔️',
            lake: '🏞️', cave: '🕳️', bridge: '🌉', well: '🪣'
        };
        
        for (const [key, sprite] of Object.entries(sprites)) {
            if (feature.toLowerCase().includes(key)) {
                return sprite;
            }
        }
        return '🌿';
    }

    loadSettings() {
        const saved = localStorage.getItem('fantasy-rpg-settings');
        if (saved) {
            this.settings = { ...this.settings, ...JSON.parse(saved) };
        }
    }

    saveSettings() {
        localStorage.setItem('fantasy-rpg-settings', JSON.stringify(this.settings));
        this.addChatMessage('system', 'Settings saved!');
    }

    generateInitialInventory() {
        this.gameState.inventory = [
            { name: "Health Potion", type: "potion", description: "Restores 50 HP", icon: "🧪", stats: "+50 HP", value: 25, rarity: "Common" },
            { name: "Bread", type: "food", description: "Simple food", icon: "🍞", stats: "+10 HP", value: 5, rarity: "Common" }
        ];
    }

    generateInitialSpells() {
        this.gameState.spells = [
            { name: "Heal", description: "Restore health", icon: "💚", manaCost: 10, effect: "heal", power: 30 }
        ];
    }

    async generateInitialWorld() {
        // Generate nearby locations
        const locations = ["Whispering Woods", "Crystal Lake"];
        for (const loc of locations) {
            try {
                await this.generateLocation(loc, false);
            } catch (error) {
                console.log(`Failed to generate ${loc}`);
            }
        }
    }

    async testConnection() {
        try {
            const response = await fetch(`${this.settings.ollamaUrl}/api/tags`);
            if (response.ok) {
                this.isConnected = true;
                document.getElementById('connection-status').innerHTML = '🟢 Connected to Ollama';
            } else {
                throw new Error('Connection failed');
            }
        } catch (error) {
            this.isConnected = false;
            document.getElementById('connection-status').innerHTML = '🔴 Ollama not connected';
        }
    }

    async callOllama(prompt) {
        if (!this.isConnected) {
            throw new Error('Not connected to Ollama');
        }

        const response = await fetch(`${this.settings.ollamaUrl}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: this.settings.model,
                prompt: prompt,
                stream: false,
                options: { temperature: this.settings.creativity }
            })
        });

        if (!response.ok) {
            throw new Error('Ollama request failed');
        }

        const data = await response.json();
        return data.response;
    }

    parseJSONResponse(response) {
        try {
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
        } catch (error) {
            console.error('Failed to parse JSON:', error);
        }
        return null;
    }

    // UI Methods
    switchScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.add('hidden');
        });
        document.getElementById(screenId).classList.remove('hidden');
        this.currentScreen = screenId;
    }

    showModal(modalId) {
        document.getElementById(modalId).classList.remove('hidden');
    }

    hideModal(modalId) {
        document.getElementById(modalId).classList.add('hidden');
    }

    hideAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.add('hidden');
        });
    }

    addChatMessage(type, message) {
        const messagesContainer = document.getElementById('chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${type}`;
        messageDiv.textContent = message;
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    updateCharacterDisplay() {
        const char = this.gameState.character;
        if (!char) return;
        
        document.getElementById('char-avatar').textContent = char.avatar;
        document.getElementById('char-name-display').textContent = char.name;
        document.getElementById('char-level').textContent = `Level ${char.level}`;
        document.getElementById('gold-display').textContent = `💰 ${char.gold}`;
        
        // Update HP bar
        const hpPercent = (char.hp / char.maxHp) * 100;
        document.getElementById('hp-mini-fill').style.width = `${hpPercent}%`;
        document.getElementById('hp-mini-text').textContent = char.hp;
        
        // Update MP bar
        const mpPercent = (char.mp / char.maxMp) * 100;
        document.getElementById('mp-mini-fill').style.width = `${mpPercent}%`;
        document.getElementById('mp-mini-text').textContent = char.mp;
    }

    updateLocationDisplay() {
        const loc = this.gameState.currentLocation;
        if (!loc) return;
        
        document.getElementById('current-location-name').textContent = loc.name;
        document.getElementById('current-weather').textContent = loc.weather;
    }

    updateInventoryDisplay() {
        const grid = document.getElementById('inventory-grid');
        grid.innerHTML = '';
        
        // Create 30 inventory slots
        for (let i = 0; i < 30; i++) {
            const slot = document.createElement('div');
            slot.className = 'inventory-slot';
            slot.dataset.index = i;
            
            if (i < this.gameState.inventory.length) {
                const item = this.gameState.inventory[i];
                slot.classList.add('occupied');
                slot.textContent = item.icon;
                slot.title = item.name;
                
                slot.addEventListener('click', () => {
                    this.showItemDetail(item, i);
                });
            }
            
            grid.appendChild(slot);
        }
    }

    showItemDetail(item, index) {
        this.selectedItem = { item, index };
        
        document.getElementById('item-detail-name').textContent = item.name;
        document.getElementById('item-detail-icon').textContent = item.icon;
        document.getElementById('item-detail-description').textContent = item.description;
        document.getElementById('item-detail-stats').textContent = `Stats: ${item.stats}`;
        
        this.showModal('item-detail-modal');
    }

    useItem(selectedItem) {
        if (!selectedItem) return;
        
        const { item, index } = selectedItem;
        const player = this.gameState.character;
        
        if (item.type === 'potion' && item.stats.includes('HP')) {
            const healing = parseInt(item.stats.match(/\d+/)[0]);
            player.hp = Math.min(player.maxHp, player.hp + healing);
            this.addChatMessage('system', `You drink the ${item.name} and recover ${healing} HP!`);
            
            // Remove item from inventory
            this.gameState.inventory.splice(index, 1);
            this.updateInventoryDisplay();
            this.updateCharacterDisplay();
            this.hideModal('item-detail-modal');
        }
    }

    equipItem(selectedItem) {
        if (!selectedItem) return;
        this.addChatMessage('system', 'Equipment system coming soon!');
    }

    dropItem(selectedItem) {
        if (!selectedItem) return;
        
        const { item, index } = selectedItem;
        this.gameState.inventory.splice(index, 1);
        
        this.addChatMessage('system', `You dropped ${item.name}.`);
        this.updateInventoryDisplay();
        this.hideModal('item-detail-modal');
    }

    updateSpellsDisplay() {
        const spellsList = document.getElementById('spells-list');
        spellsList.innerHTML = '';
        
        this.gameState.spells.forEach(spell => {
            const spellDiv = document.createElement('div');
            spellDiv.className = 'spell-item';
            spellDiv.innerHTML = `
                <div class="spell-icon">${spell.icon}</div>
                <div class="spell-info">
                    <div class="spell-name">${spell.name}</div>
                    <div class="spell-description">${spell.description}</div>
                    <div class="spell-cost">Mana Cost: ${spell.manaCost}</div>
                </div>
            `;
            spellsList.appendChild(spellDiv);
        });
    }

    drawWorldMap() {
        if (!this.worldMapCtx) return;
        
        const canvas = this.worldMapCanvas;
        const ctx = this.worldMapCtx;
        
        // Clear canvas
        ctx.fillStyle = '#2d5016';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw locations
        let x = 50;
        let y = 50;
        
        this.gameState.worldMap.forEach((location, name) => {
            // Draw location
            ctx.fillStyle = location.visited ? '#d4af37' : '#8b4513';
            ctx.fillRect(x, y, 80, 60);
            
            ctx.fillStyle = '#000';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(name, x + 40, y + 35);
            
            // Current location indicator
            if (this.gameState.currentLocation && name === this.gameState.currentLocation.name) {
                ctx.strokeStyle = '#ff4444';
                ctx.lineWidth = 3;
                ctx.strokeRect(x - 2, y - 2, 84, 64);
            }
            
            x += 120;
            if (x > canvas.width - 100) {
                x = 50;
                y += 100;
            }
        });
    }

    movePlayer(dx, dy) {
        if (!this.canvas) return;
        
        const speed = this.settings.movementSpeed * 10;
        const newX = this.gameState.playerPosition.x + (dx * speed);
        const newY = this.gameState.playerPosition.y + (dy * speed);
        
        // Boundary checking
        if (newX >= 30 && newX <= this.canvas.width - 30 &&
            newY >= 30 && newY <= this.canvas.height - 30) {
            this.gameState.playerPosition.x = newX;
            this.gameState.playerPosition.y = newY;
            
            this.checkInteractions();
        }
    }

    checkInteractions() {
        const player = this.gameState.playerPosition;
        const interactionDistance = 60;
        
        let nearbyEntity = null;
        
        for (const entity of this.gameState.mapEntities) {
            const distance = Math.sqrt(
                Math.pow(player.x - entity.x, 2) + 
                Math.pow(player.y - entity.y, 2)
            );
            
            if (distance < interactionDistance) {
                nearbyEntity = entity;
                break;
            }
        }
        
        const prompt = document.getElementById('interaction-prompt');
        if (nearbyEntity) {
            prompt.classList.remove('hidden');
            prompt.querySelector('.prompt-text').textContent = 
                `Press SPACE to interact with ${nearbyEntity.name}`;
            this.nearbyEntity = nearbyEntity;
        } else {
            prompt.classList.add('hidden');
            this.nearbyEntity = null;
        }
    }

    async interact() {
        if (!this.nearbyEntity) return;
        
        const entity = this.nearbyEntity;
        
        switch (entity.type) {
            case 'npc':
                await this.interactWithNPC(entity);
                break;
            case 'monster':
                this.addChatMessage('system', `You encounter ${entity.name}! Combat system coming soon.`);
                break;
            case 'building':
                await this.interactWithBuilding(entity);
                break;
            case 'feature':
                await this.interactWithFeature(entity);
                break;
        }
    }

    async interactWithNPC(entity) {
        const npc = entity.data;
        
        try {
            const response = await this.callOllama(`Generate a conversation response from ${npc.name}.`);
            this.addChatMessage('ai', `${npc.name}: ${response}`);
            
            // Improve relationship
            npc.relationship += 1;
            this.addChatMessage('system', `Your relationship with ${npc.name} has improved.`);
        } catch (error) {
            this.addChatMessage('system', `${npc.name} seems busy right now.`);
        }
    }

    async interactWithBuilding(entity) {
        const building = entity.data;
        
        try {
            const response = await this.callOllama(`Describe what the player finds inside ${building.name}.`);
            this.addChatMessage('ai', response);
        } catch (error) {
            this.addChatMessage('system', `You examine the ${building.name}.`);
        }
    }

    async interactWithFeature(entity) {
        const feature = entity.data;
        
        try {
            const response = await this.callOllama(`Describe what the player discovers at ${feature.name}.`);
            this.addChatMessage('ai', response);
            
            // Chance to find items
            if (Math.random() < 0.3) {
                this.generateRandomItem();
            }
        } catch (error) {
            this.addChatMessage('system', `You examine the ${feature.name} closely.`);
        }
    }

    generateRandomItem() {
        const fallbackItem = {
            name: "Mysterious Potion",
            type: "potion",
            description: "A glowing potion with unknown effects",
            icon: "🧪",
            stats: "Restores 50 HP",
            value: 25,
            rarity: "Common"
        };
        this.gameState.inventory.push(fallbackItem);
        this.addChatMessage('system', `You found: ${fallbackItem.icon} ${fallbackItem.name}!`);
    }

    handleCanvasClick(x, y) {
        // Check if clicked on an entity
        for (const entity of this.gameState.mapEntities) {
            const distance = Math.sqrt(
                Math.pow(x - entity.x, 2) + 
                Math.pow(y - entity.y, 2)
            );
            
            if (distance < 30) {
                this.addChatMessage('system', `You see ${entity.name}: ${entity.data.description || entity.data.name}`);
                return;
            }
        }
    }

    startGameLoop() {
        setInterval(() => {
            this.render();
        }, 1000 / 60); // 60 FPS
    }

    render() {
        if (this.currentScreen !== 'game-interface' || !this.ctx || !this.gameState.character) return;
        
        // Clear canvas
        this.ctx.fillStyle = '#2d5016';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grass pattern
        this.drawGrassPattern();
        
        // Draw entities
        this.gameState.mapEntities.forEach(entity => {
            this.drawEntity(entity);
        });
        
        // Draw player
        this.drawPlayer();
        
        // Draw UI elements
        this.drawMiniMap();
    }

    drawGrassPattern() {
        this.ctx.fillStyle = '#4a7c59';
        for (let x = 0; x < this.canvas.width; x += 40) {
            for (let y = 0; y < this.canvas.height; y += 40) {
                if (Math.random() < 0.3) {
                    this.ctx.fillRect(x, y, 20, 20);
                }
            }
        }
    }

    drawEntity(entity) {
        // Get entity color based on type
        let color = '#ffffff';
        if (entity.type === 'npc') {
            color = entity.data.gender === 'female' ? '#FF69B4' : '#4169E1';
        } else if (entity.type === 'monster') {
            color = '#FF4444';
        } else if (entity.type === 'building') {
            color = '#8B4513';
        } else if (entity.type === 'feature') {
            color = '#228B22';
        }
        
        // Draw shadow
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.fillRect(entity.x - 10 + 2, entity.y - 10 + 2, 20, 20);
        
        // Draw entity as colored rectangle
        this.ctx.fillStyle = color;
        this.ctx.fillRect(entity.x - 10, entity.y - 10, 20, 20);
        
        // Draw border
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(entity.x - 10, entity.y - 10, 20, 20);
        
        // Draw name label
        this.ctx.font = '12px Arial';
        this.ctx.fillStyle = '#d4af37';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(entity.name, entity.x, entity.y + 25);
        
        // Draw interaction indicator if nearby
        if (this.nearbyEntity === entity) {
            this.ctx.strokeStyle = '#d4af37';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(entity.x, entity.y, 25, 0, 2 * Math.PI);
            this.ctx.stroke();
        }
    }

    drawPlayer() {
        const player = this.gameState.playerPosition;
        
        // Get player color based on class
        const classColors = {
            warrior: '#FF6B35',
            mage: '#9B59B6',
            rogue: '#2ECC71',
            paladin: '#F39C12',
            necromancer: '#8E44AD'
        };
        const playerColor = classColors[this.gameState.character.class] || '#4CAF50';
        
        // Draw shadow
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(player.x - 12 + 2, player.y - 12 + 2, 24, 24);
        
        // Draw player as colored rectangle
        this.ctx.fillStyle = playerColor;
        this.ctx.fillRect(player.x - 12, player.y - 12, 24, 24);
        
        // Draw border
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(player.x - 12, player.y - 12, 24, 24);
        
        // Draw player name
        this.ctx.font = '14px Arial';
        this.ctx.fillStyle = '#4CAF50';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(this.gameState.character.name, player.x, player.y + 30);
        
        // Draw selection circle
        this.ctx.strokeStyle = '#4CAF50';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.arc(player.x, player.y, 25, 0, 2 * Math.PI);
        this.ctx.stroke();
    }

    drawMiniMap() {
        const miniMapSize = 120;
        const miniMapX = this.canvas.width - miniMapSize - 10;
        const miniMapY = 10;
        
        // Draw minimap background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(miniMapX, miniMapY, miniMapSize, miniMapSize);
        
        this.ctx.strokeStyle = '#d4af37';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(miniMapX, miniMapY, miniMapSize, miniMapSize);
        
        // Draw entities on minimap
        const scaleX = miniMapSize / this.canvas.width;
        const scaleY = miniMapSize / this.canvas.height;
        
        this.gameState.mapEntities.forEach(entity => {
            const x = miniMapX + (entity.x * scaleX);
            const y = miniMapY + (entity.y * scaleY);
            
            this.ctx.fillStyle = entity.type === 'npc' ? '#4CAF50' : 
                               entity.type === 'monster' ? '#f44336' : '#2196F3';
            this.ctx.fillRect(x - 1, y - 1, 2, 2);
        });
        
        // Draw player on minimap
        const playerX = miniMapX + (this.gameState.playerPosition.x * scaleX);
        const playerY = miniMapY + (this.gameState.playerPosition.y * scaleY);
        
        this.ctx.fillStyle = '#d4af37';
        this.ctx.fillRect(playerX - 2, playerY - 2, 4, 4);
    }

    async processAction() {
        const action = document.getElementById('action-input').value.trim();
        if (!action) return;

        document.getElementById('action-input').value = '';
        this.addChatMessage('player', action);

        // Check for special commands
        if (action.toLowerCase().includes('inventory')) {
            this.showModal('inventory-modal');
            this.updateInventoryDisplay();
            return;
        }

        // General AI response
        await this.getAIResponse(action);
    }

    async getAIResponse(action) {
        const context = this.buildGameContext();
        const prompt = `${context}

        Player action: "${action}"

        As the game master, respond to this action. Keep the response engaging and around 2-3 paragraphs.`;

        try {
            const response = await this.callOllama(prompt);
            this.addChatMessage('ai', response);
        } catch (error) {
            this.addChatMessage('system', 'The mystical forces seem to be disrupted. Please try again.');
        }
    }

    buildGameContext() {
        const char = this.gameState.character;
        const loc = this.gameState.currentLocation;
        
        return `Game Context:
        Player: ${char.name} (Level ${char.level} ${char.class})
        Location: ${loc.name}
        Description: ${loc.description}
        Weather: ${loc.weather}
        NPCs present: ${loc.npcs.map(n => n.name).join(', ')}
        Monsters nearby: ${loc.monsters.map(m => m.name).join(', ')}`;
    }

    // Placeholder methods for missing functionality
    performCombatAction() {
        this.addChatMessage('system', 'Combat system coming soon!');
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new FantasyRPGGame();
});
