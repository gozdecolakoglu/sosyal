1-Kurulumlar,
Template kurulumu
Nodemon paket kurulumu
Express paket kurulumu
Github Repo 
2- Template dosyalarının ayarlanması,
Static dosyalar
Views dosyalar
Partials dosyalar
3- Veritabanı bağlantıları,
Veritabanı bağlantısı
MongoDb
ENV
Mongoose paket kurulumu
4-MVC Yapısı,
Model
View
Controller
5- Model oluşturma,
Mongoose
Schema Yapısı
6- Thunder Client extension
Thunder client kurulumu
collection,request, reponse
Photolar için controller route ve app .js dosyalarında düzenleme
modeller yardımıyla yeni fotoğraflar eklenmesi sağlandı mongodb den kontrol edildi. thunder clienttan istekler gönderildi.
7-photoların listelenmesi ve sıralanması
dinamik photolar eklenmesi name ve descriptionların eklenmesi
menü tıklanmasında hangi menüdeysek hover olması controllera link eklenmesi ve activelik durumunun güncellenmesi
8-photo sayfasının oluşturulması
9- register sayfasının oluşturulması
10- kayıt işlemlerinde şifre gizleme,
Bcrypt JS kurulumu
password şifreleme
login sayfasının  oluşturulması
11- Kullanıcı yetkileri,
Authentication, Authorization, JSON web token jwt
12- Token kayıt,
cookie parser kurulumu
13- Kayıtlı kullanıcı için dinamik sayfa görünümü
14- Validation kavramı, validator kurulumu, Register uyarıları
15- Fotoğraf ve kullanıcı ilişkisi, Kullanıcının fotoğraf eklemesi
16- Görsel yükleme, cloudinary platformu ilişkisi, cloudinary kurulumu , express file upload paketi kurulumu
17- Kullanıcıların ve Profil sayfalarının oluşturulması
18- bugların giderilmesi, follow,followers
19- follow-followers-unfollow, method-override kurulumu

.env dosyasında olması gerekenler:
// mongodb için;
DB_URL=
PORT=
//json web token için;
JWT_SECRET = 
//cloudinart için ;
CLOUD_NAME=
CLOUD_API_KEY=
CLOUD_API_SECRET=

indirilen paketler:
npm init
npm install express
npm install -D nodemon
npm i mongoose
npm i ejs
npm i dotenv
npm i cookie -parser
npm i bcryptjs
npm i validator
npm i jsonwebtoken
npm i cloudinary
npm i express-fileupload
npm i method-override




