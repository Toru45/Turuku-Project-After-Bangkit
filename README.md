![Turuku_Logo (1)](https://github.com/user-attachments/assets/d85e52f8-af2f-4b2a-ad53-fcec0b7a5008)
# TEAM CLOUD COMPUTING
This is the repository is for CLOUD COMPUTING PROJECT C22-PS064 TEAM. This contains all the necessary files and documents for the project.

## MEET CLOUD COMPUTING TEAM!
| Learning Path      | Student ID   | Name                                                 | University                                          |
| ------------------ | ------------ | ---------------------------------------------------- | --------------------------------------------------- |
| Cloud Computing    | C006B4KY1356 | [Faiq Radiansyah](https://github.com/Toru45)        | Universitas Brawijaya                               |
| Cloud Computing    | C193B4KY3692 | [Rangga Saputra](https://github.com/I4MRangga)      | Universitas Bina Sarana Informatika    

## ARCHITECTURE 
![download (1)](https://github.com/user-attachments/assets/2eb232e2-2c5a-4784-bb7b-384d44aa2b68)

| Component           | Tools & Cloud Infrastructure                                                                                          |
|---------------------|-----------------------------------------------------------------------------------------------------------|
| **Cloud Computing**  | ExpressJS, NodeJS, Docker, Cloud Run, Artifact Registry,Redis MemoryStore, Google Pub/Sub, Cloud Monitoring, Grafana, OpenAPI, Sinch Mailgun, Virtual Machine, MySQL, Google Secret Manager, Cloud Ops of Agent, Javascript Web Token, Python Flask API, Miro, VPC, Workload Identity Pool |

## API DOCUMENTATION
We are using OPEN API for documentating our API. For reading it, you must :
1. You must clone this repository.
2. Open `Turuku Open API.YAML`
3. You can read it using OPEN API Editor :
   * If you are using Visual Studio Code, you can install the OPEN API [Extension ](https://marketplace.visualstudio.com/items?itemName=42Crunch.vscode-openapi)
   * If you are using Jetbrains, you can install [Plugin OPEN API ](https://plugins.jetbrains.com/plugin/14837-openapi-swagger-editor)
   * Or copy the text in `Turuku Open API.YAML` and paste it in [OPEN API Online Editor](https://editor.swagger.io/)


## How to use

* **Clone into your local repository** 
  <pre>git clone https://github.com/Turuku-Bangkit-Capstone-Project/Cloud-Computing-BANGKIT.git</pre>
* **How To Install Dependencies**</br>
  Open the project folder in your code editor or terminal, make sure you are in root directory (one level) with `package.json` and run this command in terminal :
  <pre>npm i</pre>

* **Config all environment**</br>
  1. Open the file .env.example and copy all the code and create new file named *.env* and paste all the code you copied before</br>
  the configuration will looks like the following : 
      <pre>
      DB_NAME=This is for your mysql database name
      SQL_HOST=This is for your mysql host server (example: localhost)
      SQL_USER=This is for your mysql username
      SQL_PASSWORD=This is for your mysql password
      ACCESS_TOKEN_SECRET=This is your JWT Access Token secret 
      REFRESH_TOKEN_SECRET=This is your JWT Access Access secret
      MAILGUN_API_KEY=This is your mailgun api key
      MAILGUN_DOMAIN=This is your mailgun domain name (make sure the domain is verified)
      MAILGUN_FROM_EMAIL=This is for your email sender for mailgun
      TURUKU-ML-API= This is link for ML API Deployment link (example : http://127.0.0.1:5000)
      </pre>
  2. To import MySQL Database please follow this step :
  * If you want to import database from terminal :
    <pre>mysql -u YOUR_USERNAME -p</pre>
    <pre>USE YOUR_DATABASE_NAME;</pre>
    <pre>USE YOUR_DATABASE_NAME;</pre>
    Then copy the path to `turuku.sql` in config folder
    <pre>source /path/to/your/turuku.sql;</pre>
  * If you want to import database from phpMyAdmin :
    1. Open phpMyAdmin
    2. Select your database
    3. Click on import
    4. Select file `turuku.sql` in config folder
    5. Click on import




## How to run
* If you want to run the project in development mode, you can run the following command in your terminal :
  <pre>npx nodemon start:Dev</pre>
* If you want to run the project in production mode, you can run the following command in your terminal :
  <pre>node index.js</pre>



## Other Repository
1. ### Machine Learning Repository
    <pre> https://github.com/Turuku-Bangkit-Capstone-Project/Machine-Learning </pre>
2. ### Mobile Developer Repository
    <pre> https://github.com/Turuku-Bangkit-Capstone-Project/Mobile-Development </pre>

