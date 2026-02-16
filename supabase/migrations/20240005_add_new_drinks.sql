-- Add new wines and cocktails to The Connerseur drink library

-- NEW WINES
INSERT INTO menu_items (name, description, ingredients, category, is_active, sort_order) VALUES
(
    'Pinot Noir',
    'Elegance over power, red fruits and floral notes abound.',
    'Premium Pinot Noir Selection',
    'Wine', false, 208
),
(
    'Bordeaux Style',
    'The classic red blend modelled the world over, subtle dark fruit expression.',
    'Premium Bordeaux Style Selection',
    'Wine', false, 209
),
(
    'Italian',
    'A history of elegance, the essence of terroir.',
    'Premium Italian Wine Selection',
    'Wine', false, 210
)
ON CONFLICT DO NOTHING;

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
),
(
    'French Martini',
    'Pineapple foam meets bright lush strawberry. A refreshing concoction.',
    'Vodka, Chambord, Pineapple Juice',
    'Cocktails', false, 127
),
(
    'Lemon Drop',
    'Easy drinking, bright and zesty. Crisp and clean.',
    'Vodka, Lemon Juice, Simple Syrup, Cointreau, Lemon Wedge',
    'Cocktails', false, 128
),
(
    'Spicy Marg',
    'Smoky heat meets bright citrus. A mezcal margarita with a kick.',
    'Mezcal, Cointreau, Lime Juice, Agave Nectar, Jalapeno, Tajin Rim',
    'Cocktails', false, 129
),
(
    'Pimm''s Cup',
    'A toast to the Brits. The quintessential summer garden drink.',
    'Pimm''s, Lemon Lime Soda, Cucumber, Lemon Wheel',
    'Cocktails', false, 130
)
ON CONFLICT DO NOTHING;
