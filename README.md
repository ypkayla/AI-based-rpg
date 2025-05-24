# 🏰 Fantasy RPG - AI-Powered Adventure Game

An immersive fantasy RPG that uses your locally installed Ollama to create infinite, AI-generated adventures. Build relationships, fight monsters, explore an ever-expanding world, and create your own epic story!

## 🌟 Features

### Core Gameplay
- **5 Character Classes**: Warrior, Mage, Rogue, Paladin, Necromancer
- **Infinite World Generation**: AI creates new locations, NPCs, and monsters on demand
- **Persistent World Memory**: Revisit locations and continue relationships
- **Real-time Combat System**: Turn-based battles with strategy elements
- **Character Progression**: Level up, gain stats, learn spells, collect loot

### Social & Romance System
- **Relationship Building**: Build relationships with NPCs through interactions
- **Romance Options**: Flirt and develop romantic relationships with characters
- **Companion System**: Recruit allies to join your adventure
- **Dynamic Personalities**: Each NPC has unique traits and responds differently

### Advanced Features
- **AI-Generated Content**: Locations, NPCs, monsters, quests, and loot all created by AI
- **Save/Load System**: Continue your adventure anytime
- **Inventory Management**: Collect weapons, armor, potions, and treasures
- **Magic System**: Cast spells with mana costs and effects
- **Day/Night Cycle**: Time progression affects the world
- **Weather System**: Dynamic weather in each location

## 🎮 Character Classes

### ⚔️ Warrior
- **High HP & Defense**: Tank damage and protect allies
- **Strong Physical Attacks**: Deal massive melee damage
- **Best For**: Players who like direct combat and high survivability

### 🔮 Mage
- **High Mana Pool**: Cast powerful spells frequently
- **Elemental Magic**: Fire, ice, lightning, and arcane spells
- **Best For**: Players who prefer magical combat and strategy

### 🗡️ Rogue
- **High Speed**: Act first in combat and dodge attacks
- **Critical Hits**: Deal massive damage with sneak attacks
- **Best For**: Players who like agility and precision strikes

### 🛡️ Paladin
- **Balanced Stats**: Good at everything, master of none
- **Holy Magic**: Healing and protective spells
- **Best For**: Versatile players who want options in any situation

### 💀 Necromancer
- **Dark Magic**: Death spells and undead summoning
- **High Mana**: Sustain magical combat for extended periods
- **Best For**: Players who enjoy dark themes and magical power

## 🎯 Gameplay Systems

### Combat
- **Turn-based Strategy**: Choose between Attack, Magic, Defend, or Flee
- **Damage Calculation**: Stats, equipment, and RNG determine outcomes
- **Mana Management**: Spells cost mana, plan your magical usage
- **Loot Rewards**: Defeated enemies drop gold, items, and experience

### Relationships
- **Relationship Levels**: Build trust and affection with NPCs
- **Romance Options**: Develop romantic relationships with compatible characters
- **Dialogue Choices**: Your words and actions affect how NPCs view you
- **Companion Recruitment**: Convince NPCs to join your party

### Exploration
- **Infinite Locations**: AI generates new areas when you explore
- **Persistent World**: Return to previous locations and find them unchanged
- **Hidden Secrets**: Discover treasures, lore, and special encounters
- **Dynamic Events**: Random encounters and opportunities

### Character Progression
- **Experience Points**: Gain XP from combat, quests, and exploration
- **Level Up Bonuses**: Increase HP, MP, Attack, Defense, and Speed
- **Equipment System**: Weapons, armor, and accessories boost your stats
- **Spell Learning**: Acquire new magical abilities as you progress

## 🛠️ Setup Instructions

### Prerequisites
1. **Ollama Installation**: Download and install from [ollama.ai](https://ollama.ai/)
2. **AI Model**: Pull at least one model (recommended: `llama2`, `mistral`, or `neural-chat`)
3. **Modern Web Browser**: Chrome, Firefox, Safari, or Edge

### Installation Steps

1. **Install Ollama**
   ```bash
   # Windows/Mac: Download installer from https://ollama.ai/
   # Linux:
   curl -fsSL https://ollama.ai/install.sh | sh
   ```

2. **Download AI Models**
   ```bash
   # Recommended for fantasy roleplay
   ollama pull llama2
   
   # Alternative models
   ollama pull mistral
   ollama pull neural-chat
   ollama pull codellama
   ```

3. **Start Ollama Service**
   ```bash
   ollama serve
   ```

4. **Launch the Game**
   - Open `index.html` in your web browser
   - The game will automatically connect to Ollama at `localhost:11434`

## 🎲 How to Play

### Getting Started
1. **Create Character**: Choose name, class, and gender
2. **Explore the Starting Village**: Talk to NPCs and learn about the world
3. **Begin Your Adventure**: Use the action input or quick buttons to interact

### Basic Commands
- **Movement**: "explore", "travel to [location]", "go north"
- **Combat**: "attack [monster]", "fight [enemy]", "cast spell"
- **Social**: "talk to [NPC]", "flirt with [character]", "ask about [topic]"
- **Inventory**: "check inventory", "use [item]", "equip [weapon]"
- **Magic**: "cast [spell]", "heal myself", "use magic"

### Advanced Interactions
- **Romance**: Build relationships through conversation and actions
- **Quests**: NPCs may offer tasks and adventures
- **Trading**: Buy and sell items with merchants
- **Exploration**: Discover new locations and secrets
- **Combat Strategy**: Use different tactics for different enemies

## 🎨 Game Interface

### Main Screen Layout
- **Character HUD**: HP, MP, XP bars, level, and gold
- **World View**: Current location, weather, NPCs, and monsters
- **Chat Log**: All game messages and AI responses
- **Action Input**: Type commands or use quick action buttons
- **Inventory Tabs**: Items, spells, companions, and world map

### Combat Interface
- **Enemy Display**: Monster stats, HP, and level
- **Combat Actions**: Attack, Magic, Defend, Flee buttons
- **Combat Log**: Turn-by-turn battle description
- **Real-time Updates**: Watch HP bars change during battle

## ⚙️ Settings & Configuration

### AI Settings
- **Ollama URL**: Change if running on different port/server
- **Model Selection**: Choose which AI model to use
- **Creativity Level**: Adjust AI randomness (0.1 = conservative, 1.0 = very creative)
- **Auto-save**: Automatically save progress

### Recommended Settings
- **Model**: `llama2` or `mistral` for best fantasy roleplay
- **Creativity**: 0.7-0.9 for engaging but coherent responses
- **Auto-save**: Enabled to prevent progress loss

## 🔧 Troubleshooting

### Connection Issues
- **Red Status Indicator**: Ollama not running or accessible
  - Ensure Ollama is installed and running (`ollama serve`)
  - Check URL in settings (default: `http://localhost:11434`)
  - Restart Ollama service if needed

### Performance Issues
- **Slow AI Responses**: 
  - Use smaller models (`llama2:7b` instead of `llama2:13b`)
  - Lower creativity setting
  - Ensure sufficient system RAM

### Model Issues
- **Model Not Found**: 
  - Pull the model: `ollama pull [model-name]`
  - Check available models: `ollama list`
  - Update model name in settings

### CORS Errors
- **Cross-Origin Issues**:
  - Ollama handles CORS automatically
  - If problems persist: `OLLAMA_ORIGINS=* ollama serve`

## 🎯 Tips for Best Experience

### Roleplay Tips
1. **Be Descriptive**: Detailed actions get better AI responses
2. **Stay in Character**: Immerse yourself in your chosen class
3. **Build Relationships**: Invest time in NPC interactions
4. **Explore Thoroughly**: Don't rush through locations
5. **Experiment**: Try different approaches to situations

### Combat Strategy
1. **Know Your Class**: Play to your character's strengths
2. **Manage Resources**: Don't waste mana early in fights
3. **Use Terrain**: Mention environmental factors in actions
4. **Prepare**: Stock up on potions and equipment
5. **Retreat When Needed**: Live to fight another day

### World Building
1. **Ask Questions**: NPCs have knowledge about the world
2. **Remember Details**: The AI remembers your choices
3. **Create Connections**: Link different locations and characters
4. **Document Adventures**: Keep notes of important events
5. **Return Often**: Revisit locations to see changes

## 🌍 Game World Features

### Infinite Exploration
- **Procedural Generation**: New locations created on demand
- **Persistent Memory**: World state saved between sessions
- **Interconnected Areas**: Locations reference each other
- **Dynamic Events**: Random encounters and opportunities

### Rich NPCs
- **Unique Personalities**: Each character has distinct traits
- **Relationship Tracking**: NPCs remember your interactions
- **Romance System**: Build romantic relationships over time
- **Quest Givers**: NPCs offer adventures and tasks

### Monster Variety
- **Scaling Difficulty**: Enemies match your level and location
- **Unique Abilities**: Each monster type has special attacks
- **Loot Tables**: Different enemies drop different rewards
- **Behavioral AI**: Monsters act according to their nature

## 📁 File Structure

```
fantasy-rpg/
├── index.html          # Main game interface
├── style.css           # Game styling and animations
├── script.js           # Core game logic and AI integration
└── README.md           # This documentation
```

## 🔮 Future Enhancements

### Planned Features
- **Guild System**: Join organizations with unique benefits
- **Crafting System**: Create items from gathered materials
- **Mount System**: Ride creatures for faster travel
- **Housing**: Build and customize your own base
- **Multiplayer**: Share worlds with other players

### AI Improvements
- **Image Generation**: Visual representations of locations and characters
- **Voice Acting**: AI-generated character voices
- **Dynamic Music**: Procedural background music
- **Advanced Memory**: Long-term world state persistence

## 🤝 Contributing

### How to Contribute
1. **Report Bugs**: Use GitHub issues for bug reports
2. **Suggest Features**: Propose new gameplay elements
3. **Improve AI Prompts**: Enhance AI response quality
4. **Add Content**: Create new scenarios and encounters
5. **Optimize Performance**: Improve code efficiency

### Development Guidelines
- **Modular Design**: Keep features separate and reusable
- **AI Integration**: Ensure new features work with AI generation
- **User Experience**: Prioritize intuitive and engaging gameplay
- **Performance**: Maintain smooth operation on various devices

## 📜 License

This project is open source and available under the MIT License. Feel free to use, modify, and distribute as needed.

## 🎉 Credits

- **AI Technology**: Powered by Ollama and various language models
- **Game Design**: Inspired by classic fantasy RPGs and modern AI capabilities
- **Community**: Thanks to all players and contributors

---

**Ready for Adventure?** 🗡️✨

Launch the game and begin your epic fantasy journey! Create your character, explore mysterious lands, build relationships, fight monsters, and write your own legend in this AI-powered world.

*May your adventures be legendary!* 🏰🐉👑
