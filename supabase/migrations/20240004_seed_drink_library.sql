-- Expand The Connerseur drink library with classic cocktails, wines, beers, spirits, and non-alcoholic options
-- Existing 15 drinks remain untouched (they are already is_active = true)
-- New drinks start as is_active = false (available in library, not on menu until bartender activates them)

-- Add unique index on name to prevent duplicate drinks
CREATE UNIQUE INDEX IF NOT EXISTS idx_menu_items_unique_name ON menu_items(LOWER(name));

-- Insert new drinks (ON CONFLICT DO NOTHING preserves existing entries)

-- COCKTAILS (~25 new classics)
INSERT INTO menu_items (name, description, ingredients, category, is_active, sort_order) VALUES
(
    'Manhattan',
    'Rye whiskey royalty. Bold, stirred, and impossibly smooth.',
    'Rye Whiskey, Sweet Vermouth, Angostura Bitters, Maraschino Cherry',
    'Cocktails', false, 100
),
(
    'Whiskey Sour',
    'Citrus meets bourbon in a frothy embrace. Perfectly balanced.',
    'Bourbon, Fresh Lemon Juice, Simple Syrup, Egg White, Cherry',
    'Cocktails', false, 101
),
(
    'Daiquiri',
    'Hemingway''s liquid muse. Simple, sharp, and devastatingly good.',
    'White Rum, Fresh Lime Juice, Simple Syrup',
    'Cocktails', false, 102
),
(
    'Sidecar',
    'Parisian elegance with a citrus twist. Brandy at its finest.',
    'Cognac, Cointreau, Fresh Lemon Juice, Sugar Rim',
    'Cocktails', false, 103
),
(
    'Mai Tai',
    'Tropical escapism in a glass. Close your eyes and taste paradise.',
    'Aged Rum, White Rum, Orange Curaçao, Orgeat, Fresh Lime Juice',
    'Cocktails', false, 104
),
(
    'Boulevardier',
    'A Negroni''s whiskey-loving cousin. Dark, brooding, unforgettable.',
    'Bourbon, Campari, Sweet Vermouth, Orange Peel',
    'Cocktails', false, 105
),
(
    'Aperol Spritz',
    'Italian sunshine in a wine glass. Bitter, bubbly, and effortless.',
    'Aperol, Prosecco, Soda Water, Orange Slice',
    'Cocktails', false, 106
),
(
    'French 75',
    'Champagne meets gin in a celebration of everything elegant.',
    'Gin, Fresh Lemon Juice, Simple Syrup, Champagne',
    'Cocktails', false, 107
),
(
    'Bee''s Knees',
    'Prohibition-era sweetness. Honey and gin, meant to be together.',
    'Gin, Fresh Lemon Juice, Honey Syrup',
    'Cocktails', false, 108
),
(
    'Aviation',
    'Violet-tinged sophistication. A pre-Prohibition jewel, rediscovered.',
    'Gin, Maraschino Liqueur, Crème de Violette, Fresh Lemon Juice',
    'Cocktails', false, 109
),
(
    'Last Word',
    'Equal parts everything. A perfectly balanced green mystery.',
    'Gin, Green Chartreuse, Maraschino Liqueur, Fresh Lime Juice',
    'Cocktails', false, 110
),
(
    'Penicillin',
    'The modern classic. Smoky, spicy, and strangely medicinal in the best way.',
    'Blended Scotch, Fresh Lemon Juice, Honey-Ginger Syrup, Islay Scotch Float',
    'Cocktails', false, 111
),
(
    'Dark ''n'' Stormy',
    'Bermuda in a glass. Dark rum crashing into ginger waves.',
    'Dark Rum, Ginger Beer, Fresh Lime Juice',
    'Cocktails', false, 112
),
(
    'Moscow Mule',
    'Copper mug magic. Ginger, vodka, and an attitude.',
    'Vodka, Ginger Beer, Fresh Lime Juice, Lime Wedge',
    'Cocktails', false, 113
),
(
    'Pisco Sour',
    'South American soul in a coupe glass. Frothy, tart, magnificent.',
    'Pisco, Fresh Lime Juice, Simple Syrup, Egg White, Angostura Bitters',
    'Cocktails', false, 114
),
(
    'Caipirinha',
    'Brazil''s national treasure. Muddled limes, raw sugar, pure joy.',
    'Cachaça, Fresh Lime, Raw Sugar',
    'Cocktails', false, 115
),
(
    'Mint Julep',
    'Derby Day essential. Bourbon, mint, and crushed ice perfection.',
    'Bourbon, Fresh Mint, Simple Syrup, Crushed Ice',
    'Cocktails', false, 116
),
(
    'Sazerac',
    'New Orleans in liquid form. Rye, absinthe, and centuries of history.',
    'Rye Whiskey, Peychaud''s Bitters, Sugar, Absinthe Rinse, Lemon Peel',
    'Cocktails', false, 117
),
(
    'Gimlet',
    'Gin and lime, stripped to perfection. Naval officers approved.',
    'Gin, Fresh Lime Juice, Simple Syrup',
    'Cocktails', false, 118
),
(
    'Paper Plane',
    'A modern masterpiece. Bitter, sweet, boozy, and perfectly balanced.',
    'Bourbon, Aperol, Amaro Nonino, Fresh Lemon Juice',
    'Cocktails', false, 119
),
(
    'Jungle Bird',
    'Tiki meets Italian bitters. Tropical darkness in the best way.',
    'Dark Rum, Campari, Pineapple Juice, Fresh Lime Juice, Simple Syrup',
    'Cocktails', false, 120
),
(
    'Piña Colada',
    'If you like getting caught in the rain. Creamy coconut paradise.',
    'White Rum, Coconut Cream, Pineapple Juice, Fresh Lime',
    'Cocktails', false, 121
),
(
    'Tequila Sunrise',
    'A gradient of gorgeous. Tequila, orange, and a grenadine sunset.',
    'Tequila, Orange Juice, Grenadine, Orange Slice, Cherry',
    'Cocktails', false, 122
),
(
    'Long Island Iced Tea',
    'Five spirits walk into a glass. Dangerously smooth chaos.',
    'Vodka, Gin, Rum, Tequila, Triple Sec, Lemon Juice, Cola',
    'Cocktails', false, 123
),
(
    'Rum & Coke',
    'The universal crowd-pleaser. Simple, reliable, always welcome.',
    'Rum, Cola, Fresh Lime Wedge',
    'Cocktails', false, 124
)
ON CONFLICT DO NOTHING;

-- WINE (~8 new selections)
INSERT INTO menu_items (name, description, ingredients, category, is_active, sort_order) VALUES
(
    'Rosé',
    'Pink, playful, and always in season. Summer''s favorite sip.',
    'Premium Rosé Selection',
    'Wine', false, 200
),
(
    'Champagne',
    'Celebration incarnate. Tiny bubbles, enormous vibes.',
    'Premium Champagne Selection',
    'Wine', false, 201
),
(
    'Prosecco',
    'Italy''s sparkling gift to the world. Light, festive, irresistible.',
    'Premium Prosecco Selection',
    'Wine', false, 202
),
(
    'Pinot Grigio',
    'Crisp, clean, and effortlessly refreshing. A white wine staple.',
    'Premium Pinot Grigio Selection',
    'Wine', false, 203
),
(
    'Sauvignon Blanc',
    'Zesty and herbaceous. The thinking person''s white wine.',
    'Premium Sauvignon Blanc Selection',
    'Wine', false, 204
),
(
    'Chardonnay',
    'Rich, buttery, and full of character. The queen of whites.',
    'Premium Chardonnay Selection',
    'Wine', false, 205
),
(
    'Cabernet Sauvignon',
    'Bold and structured. The king of reds demands respect.',
    'Premium Cabernet Sauvignon Selection',
    'Wine', false, 206
),
(
    'Merlot',
    'Velvet in a glass. Smooth, plummy, and endlessly drinkable.',
    'Premium Merlot Selection',
    'Wine', false, 207
)
ON CONFLICT DO NOTHING;

-- BEER (~8 new selections, new category)
INSERT INTO menu_items (name, description, ingredients, category, is_active, sort_order) VALUES
(
    'IPA',
    'Hop-forward and unapologetic. For those who like it bitter.',
    'Craft IPA Selection',
    'Beer', false, 300
),
(
    'Lager',
    'Clean, crisp, and universally loved. The people''s beer.',
    'Premium Lager Selection',
    'Beer', false, 301
),
(
    'Pilsner',
    'Golden, bright, and perfectly balanced. Czech engineering at its finest.',
    'Premium Pilsner Selection',
    'Beer', false, 302
),
(
    'Stout',
    'Dark, rich, and full of mystery. Coffee and chocolate undertones.',
    'Premium Stout Selection',
    'Beer', false, 303
),
(
    'Wheat Beer',
    'Hazy, fruity, and refreshing. Bavarian summer in a glass.',
    'Premium Wheat Beer Selection',
    'Beer', false, 304
),
(
    'Pale Ale',
    'The gateway craft beer. Balanced hops, easy drinking, big flavor.',
    'Craft Pale Ale Selection',
    'Beer', false, 305
),
(
    'Amber Ale',
    'Malty warmth with a caramel kiss. The cozy fireside beer.',
    'Craft Amber Ale Selection',
    'Beer', false, 306
),
(
    'Porter',
    'Dark and brooding with a chocolatey soul. Stout''s sophisticated sibling.',
    'Premium Porter Selection',
    'Beer', false, 307
)
ON CONFLICT DO NOTHING;

-- SPIRITS (~8 new neat/rocks options)
INSERT INTO menu_items (name, description, ingredients, category, is_active, sort_order) VALUES
(
    'Bourbon',
    'America''s native spirit. Sweet corn warmth with a vanilla finish.',
    'Premium Bourbon Selection, Neat or On the Rocks',
    'Spirits', false, 400
),
(
    'Scotch',
    'Liquid Scotland. Smoky, peaty, and steeped in centuries of tradition.',
    'Premium Scotch Selection, Neat or On the Rocks',
    'Spirits', false, 401
),
(
    'Tequila',
    'Agave excellence, straight up. Earthy, smooth, and full of character.',
    'Premium Tequila Selection, Neat or On the Rocks',
    'Spirits', false, 402
),
(
    'Rum',
    'Caribbean liquid gold. Sweet, smooth, and sun-soaked.',
    'Premium Rum Selection, Neat or On the Rocks',
    'Spirits', false, 403
),
(
    'Gin',
    'Botanical brilliance in its purest form. Juniper-forward sophistication.',
    'Premium Gin Selection, Neat or On the Rocks',
    'Spirits', false, 404
),
(
    'Vodka',
    'Crystal clear and infinitely versatile. The blank canvas of spirits.',
    'Premium Vodka Selection, Neat or On the Rocks',
    'Spirits', false, 405
),
(
    'Cognac',
    'French refinement, distilled. Warm, complex, and deeply luxurious.',
    'Premium Cognac Selection, Neat or Snifter',
    'Spirits', false, 406
),
(
    'Mezcal',
    'Tequila''s smoky, mysterious cousin. Artisanal agave with attitude.',
    'Premium Mezcal Selection, Neat or On the Rocks',
    'Spirits', false, 407
)
ON CONFLICT DO NOTHING;

-- NON-ALCOHOLIC (~8 options, new category)
INSERT INTO menu_items (name, description, ingredients, category, is_active, sort_order) VALUES
(
    'Virgin Mojito',
    'All the minty lime magic, none of the morning regrets.',
    'Fresh Mint, Lime, Simple Syrup, Soda Water',
    'Non-Alcoholic', false, 500
),
(
    'Shirley Temple',
    'Nostalgic sweetness. Grenadine, ginger ale, and cherry charm.',
    'Ginger Ale, Grenadine, Maraschino Cherry, Orange Slice',
    'Non-Alcoholic', false, 501
),
(
    'Arnold Palmer',
    'Half tea, half lemonade, fully refreshing. A legend''s drink.',
    'Iced Tea, Fresh Lemonade',
    'Non-Alcoholic', false, 502
),
(
    'Virgin Piña Colada',
    'Tropical bliss without the buzz. Creamy coconut perfection.',
    'Coconut Cream, Pineapple Juice, Fresh Lime, Crushed Ice',
    'Non-Alcoholic', false, 503
),
(
    'Sparkling Water',
    'Effervescent simplicity. Sometimes less is everything.',
    'Sparkling Water, Choice of Citrus',
    'Non-Alcoholic', false, 504
),
(
    'Ginger Beer',
    'Spicy, fizzy, and fiercely refreshing. Not your average soda.',
    'Premium Ginger Beer, Lime Wedge',
    'Non-Alcoholic', false, 505
),
(
    'Club Soda & Lime',
    'The designated driver''s best friend. Clean and crisp.',
    'Club Soda, Fresh Lime, Ice',
    'Non-Alcoholic', false, 506
),
(
    'Fresh Lemonade',
    'Hand-squeezed sunshine. Tart, sweet, and impossibly refreshing.',
    'Fresh Lemon Juice, Simple Syrup, Water, Lemon Wheel',
    'Non-Alcoholic', false, 507
)
ON CONFLICT DO NOTHING;
