import { useState } from 'react';
import { useGameContext } from '../../store/GameContext';

export function ShopModal() {
  const { state, dispatch, saveGame } = useGameContext();
  const [activeTab, setActiveTab] = useState<'swords' | 'abilities'>('swords');

  const handlePurchaseSword = async (swordId: string, price: number) => {
    if (state.coins >= price) {
      dispatch({ type: 'SPEND_COINS', amount: price });
      dispatch({ type: 'UNLOCK_SWORD', swordId });
      await saveGame();
    }
  };

  const handlePurchaseAbility = async (abilityId: string, price: number) => {
    if (state.coins >= price) {
      dispatch({ type: 'SPEND_COINS', amount: price });
      dispatch({ type: 'UNLOCK_ABILITY', abilityId });
      await saveGame();
    }
  };

  const handleEquipSword = (swordId: string) => {
    dispatch({ type: 'EQUIP_SWORD', swordId });
  };

  const handleEquipAbility = (abilityId: string) => {
    dispatch({ type: 'EQUIP_ABILITY', abilityId });
  };

  return (
    <div className="shop-overlay">
      <div className="shop-modal">
        <h2>SHOP</h2>
        <p className="shop-coins">💰 Coins: {state.coins}</p>

        <div className="shop-tabs">
          <button
            className={`shop-tab ${activeTab === 'swords' ? 'active' : ''}`}
            onClick={() => setActiveTab('swords')}
          >
            Swords
          </button>
          <button
            className={`shop-tab ${activeTab === 'abilities' ? 'active' : ''}`}
            onClick={() => setActiveTab('abilities')}
          >
            Abilities
          </button>
        </div>

        <div className="shop-content">
          {activeTab === 'swords' && (
            <div className="shop-items">
              {state.swords.map(sword => (
                <div key={sword.id} className="shop-item">
                  <h3>{sword.name}</h3>
                  <p>Damage: {sword.damage}</p>
                  <p>Range: {sword.range}</p>
                  <p>Speed: {1000 / sword.attackSpeed} attacks/s</p>
                  {sword.unlocked ? (
                    <button
                      onClick={() => handleEquipSword(sword.id)}
                      className={`shop-button ${
                        state.player.equippedSword.id === sword.id ? 'equipped' : ''
                      }`}
                    >
                      {state.player.equippedSword.id === sword.id ? '✓ Equipped' : 'Equip'}
                    </button>
                  ) : (
                    <button
                      onClick={() => handlePurchaseSword(sword.id, sword.price)}
                      className="shop-button"
                      disabled={state.coins < sword.price}
                    >
                      Buy ({sword.price} coins)
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'abilities' && (
            <div className="shop-items">
              {state.abilities.map(ability => (
                <div key={ability.id} className="shop-item">
                  <h3>{ability.name}</h3>
                  <p className="ability-desc">{ability.description}</p>
                  <p className="ability-type">{ability.type.toUpperCase()}</p>
                  {ability.cooldown && <p>Cooldown: {ability.cooldown / 1000}s</p>}
                  {ability.unlocked ? (
                    <button
                      onClick={() => handleEquipAbility(ability.id)}
                      className={`shop-button ${
                        state.player.abilities.some(a => a.id === ability.id) ? 'equipped' : ''
                      }`}
                    >
                      {state.player.abilities.some(a => a.id === ability.id)
                        ? '✓ Equipped'
                        : 'Equip'}
                    </button>
                  ) : (
                    <button
                      onClick={() => handlePurchaseAbility(ability.id, ability.price)}
                      className="shop-button"
                      disabled={state.coins < ability.price}
                    >
                      Buy ({ability.price} coins)
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <button onClick={() => dispatch({ type: 'CLOSE_SHOP' })} className="menu-button close">
          Close
        </button>
      </div>
    </div>
  );
}
