-- Fix wine ingredients to be proper descriptors (placeholder notes moved to UI)

UPDATE menu_items SET ingredients = 'Premium Chardonnay Selection' WHERE LOWER(name) = 'chardonnay';
UPDATE menu_items SET ingredients = 'Premium Pinot Noir Selection' WHERE LOWER(name) = 'pinot noir';
UPDATE menu_items SET ingredients = 'Premium Bordeaux Style Selection' WHERE LOWER(name) = 'bordeaux style';
UPDATE menu_items SET ingredients = 'Premium Italian Wine Selection' WHERE LOWER(name) = 'italian';
