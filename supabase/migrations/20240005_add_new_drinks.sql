-- Add new wines and cocktails to The Connerseur drink library

-- NEW WINES
INSERT INTO menu_items (name, description, ingredients, category, is_active, sort_order) VALUES
(
    'Pinot Noir',
    'Elegance over power, red fruits and floral notes abound.',
    'e.g. light or medium body, more on the cab profile side',
    'Wine', false, 208
),
(
    'Bordeaux Style',
    'The classic red blend modelled the world over, subtle dark fruit expression.',
    'e.g. the age old question, left bank or right bank',
    'Wine', false, 209
),
(
    'Italian',
    'A history of elegance, the essence of terroir.',
    'e.g. Brunello, chianti, Nebbiolo and more',
    'Wine', false, 210
)
ON CONFLICT DO NOTHING;

-- UPDATE Chardonnay preference notes
UPDATE menu_items
SET ingredients = 'e.g. oaky, buttery, lightly toasted, crisp/clean'
WHERE LOWER(name) = 'chardonnay';

-- NEW COCKTAILS
INSERT INTO menu_items (name, description, ingredients, category, is_active, sort_order) VALUES
(
    'The Max',
    'From one of our top customers, a refreshing vodka blend.',
    'Vodka, Deep Eddy Grapefruit, Topo Chico, Lime',
    'Cocktails', false, 125
),
(
    'White Russian',
    'Mildly boozy delight with smooth velvety mouthfeel.',
    'Vodka, Kahlua, Milk',
    'Cocktails', false, 126
)
ON CONFLICT DO NOTHING;
