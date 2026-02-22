-- =============================================================================
-- Link team accounts to their teams via owner_id.
-- Run this AFTER creating team accounts in the Dashboard and running seed_teams.sql.
-- Matches auth.users email → team name.
-- =============================================================================

UPDATE teams SET owner_id = u.id FROM auth.users u WHERE u.email = 'aguaclara@cornell.edu' AND teams.name = 'AguaClara';
UPDATE teams SET owner_id = u.id FROM auth.users u WHERE u.email = 'appdev@cornell.edu' AND teams.name = 'Cornell AppDev';
UPDATE teams SET owner_id = u.id FROM auth.users u WHERE u.email = 'baja@cornell.edu' AND teams.name = 'Cornell Baja Racing';
UPDATE teams SET owner_id = u.id FROM auth.users u WHERE u.email = 'c2s2@cornell.edu' AND teams.name = 'C2S2';
UPDATE teams SET owner_id = u.id FROM auth.users u WHERE u.email = 'ccc@cornell.edu' AND teams.name = 'Cornell Concrete Canoe';
UPDATE teams SET owner_id = u.id FROM auth.users u WHERE u.email = 'cds@cornell.edu' AND teams.name = 'Cornell Data Science';
UPDATE teams SET owner_id = u.id FROM auth.users u WHERE u.email = 'cuev@cornell.edu' AND teams.name = 'Cornell Electric Vehicles';
UPDATE teams SET owner_id = u.id FROM auth.users u WHERE u.email = 'chemecar@cornell.edu' AND teams.name = 'Cornell ChemE Car';
UPDATE teams SET owner_id = u.id FROM auth.users u WHERE u.email = 'marsrover@cornell.edu' AND teams.name = 'Cornell Mars Rover';
UPDATE teams SET owner_id = u.id FROM auth.users u WHERE u.email = 'combatrobotics@cornell.edu' AND teams.name = 'Cornell Combat Robotics';
UPDATE teams SET owner_id = u.id FROM auth.users u WHERE u.email = 'assistivetech@cornell.edu' AND teams.name = 'Cornell Assistive Technologies';
UPDATE teams SET owner_id = u.id FROM auth.users u WHERE u.email = 'hyperloop@cornell.edu' AND teams.name = 'Cornell Hyperloop';
UPDATE teams SET owner_id = u.id FROM auth.users u WHERE u.email = 'rocketry@cornell.edu' AND teams.name = 'Cornell Rocketry Team';
UPDATE teams SET owner_id = u.id FROM auth.users u WHERE u.email = 'cuprobotics@cornell.edu' AND teams.name = 'Cornell Cup Robotics';
UPDATE teams SET owner_id = u.id FROM auth.users u WHERE u.email = 'cuad@cornell.edu' AND teams.name = 'CUAD';
UPDATE teams SET owner_id = u.id FROM auth.users u WHERE u.email = 'cuair@cornell.edu' AND teams.name = 'CUAir';
UPDATE teams SET owner_id = u.id FROM auth.users u WHERE u.email = 'autoboat@cornell.edu' AND teams.name = 'CU Autoboat';
UPDATE teams SET owner_id = u.id FROM auth.users u WHERE u.email = 'cuauv@cornell.edu' AND teams.name = 'CU AUV';
UPDATE teams SET owner_id = u.id FROM auth.users u WHERE u.email = 'cubmd@cornell.edu' AND teams.name = 'CUBMD';
UPDATE teams SET owner_id = u.id FROM auth.users u WHERE u.email = 'geodata@cornell.edu' AND teams.name = 'CU Geo Data';
UPDATE teams SET owner_id = u.id FROM auth.users u WHERE u.email = 'cusail@cornell.edu' AND teams.name = 'CU Sail';
UPDATE teams SET owner_id = u.id FROM auth.users u WHERE u.email = 'cuxrl@cornell.edu' AND teams.name = 'CUXRL';
UPDATE teams SET owner_id = u.id FROM auth.users u WHERE u.email = 'debut@cornell.edu' AND teams.name = 'DEBUT';
UPDATE teams SET owner_id = u.id FROM auth.users u WHERE u.email = 'dbf@cornell.edu' AND teams.name = 'Cornell Design Build Fly';
UPDATE teams SET owner_id = u.id FROM auth.users u WHERE u.email = 'dti@cornell.edu' AND teams.name = 'Cornell DTI';
UPDATE teams SET owner_id = u.id FROM auth.users u WHERE u.email = 'eia@cornell.edu' AND teams.name = 'Engineers in Action';
UPDATE teams SET owner_id = u.id FROM auth.users u WHERE u.email = 'ewb@cornell.edu' AND teams.name = 'Engineers Without Borders';
UPDATE teams SET owner_id = u.id FROM auth.users u WHERE u.email = 'esw@cornell.edu' AND teams.name = 'ESW';
UPDATE teams SET owner_id = u.id FROM auth.users u WHERE u.email = 'ewh@cornell.edu' AND teams.name = 'EWH';
UPDATE teams SET owner_id = u.id FROM auth.users u WHERE u.email = 'fsae@cornell.edu' AND teams.name = 'Cornell FSAE Racing';
UPDATE teams SET owner_id = u.id FROM auth.users u WHERE u.email = 'h4i@cornell.edu' AND teams.name = 'Hack4Impact';
UPDATE teams SET owner_id = u.id FROM auth.users u WHERE u.email = 'igem@cornell.edu' AND teams.name = 'Cornell iGEM';
UPDATE teams SET owner_id = u.id FROM auth.users u WHERE u.email = 'nexus@cornell.edu' AND teams.name = 'Nexus';
UPDATE teams SET owner_id = u.id FROM auth.users u WHERE u.email = 'seismicdesign@cornell.edu' AND teams.name = 'Cornell Seismic Design';
UPDATE teams SET owner_id = u.id FROM auth.users u WHERE u.email = 'senstech@cornell.edu' AND teams.name = 'Sens Tech';
UPDATE teams SET owner_id = u.id FROM auth.users u WHERE u.email = 'solarboat@cornell.edu' AND teams.name = 'Cornell Solar Boat';
UPDATE teams SET owner_id = u.id FROM auth.users u WHERE u.email = 'steelbridge@cornell.edu' AND teams.name = 'Cornell Steel Bridge';
