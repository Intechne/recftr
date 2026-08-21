-- OPTIONAL LOCAL/DEMO DATA. DO NOT RUN ON PRODUCTION UNLESS YOU WANT THESE RECORDS.
INSERT INTO applications (num,team,org,city,type,program,mentor,email,phone,kit,total,status) VALUES
 ('905B','Voltran Robotics 2','Pendik Fen Lisesi','İstanbul','Okul Takımı','achieve','A. Yılmaz','mentor@voltran.org','0500 000 00 00',TRUE,6400,'ÖDEME DOĞRULANDI'),
 ('TR-DR21','Gökyüzü Akademisi','Ankara BİLSEM','Ankara','Okul Takımı','adc','B. Kaya','bilsem@ornek.org','0500 000 00 01',FALSE,3100,'ÖDEME BEKLENİYOR');

INSERT INTO members (team_num,name,role,cat,consent,status) VALUES
 ('905A','Ahmet Yılmaz','MENTOR','—','—','AKTİF'),
 ('905A','Elif Kaya','KAPTAN · SÜRÜCÜ','U19','✓ Onaylı','AKTİF');
