# Symfony + React + Material UI

1. import the data from ``` docker\database\nodes_app_tree.sql ```
2. database connection settings are located in .env file - ```DATABASE_URL="mysql://root:root@127.0.0.1:3306/nodes_app?serverVersion=8&charset=utf8mb4"```
3. using Symfony CLI run ```symfony server:start``` from command line interface to launch the web server
4. open browser and type ``` http://localhost:8000/ ```

```
|   .env
|   .env.test
|   .gitignore
|   composer.json
|   composer.lock
|   docker-compose.yml
|   package-lock.json
|   package.json
|   phpunit.xml.dist
|   symfony.lock
|   tree.txt
|   webpack.config.js
|   
+---.idea
|       .gitignore
|       modules.xml
|       php.xml
|       phpunit.xml
|       SymfonyReact.iml
|       vcs.xml
|       workspace.xml
|       
+---app
+---assets
|   |   app.js
|   |   bootstrap.js
|   |   controllers.json
|   |   
|   +---components
|   |   \---Tree
|   |           index.css
|   |           index.js
|   |           
|   +---controllers
|   |       hello_controller.js
|   |       
|   +---services
|   |       emitter.js
|   |       
|   \---styles
|           app.css
+---src
|   |	Kernel.php
|   |
|   +---Controller
|   |		IndexController.php
|   |       TreeController.php
|	+---Entity
|	|		Node.php
|	|
|   \---Repository
		  NodeRepository.php
| 
+---bin
|       console
|       phpunit
|       
+---config
|   |   bundles.php
|   |   preload.php
|   |   routes.yaml
|   |   services.yaml
|   |   
|   +---packages
|   |       ...
|   |       
|   \---routes
|           framework.yaml
|           web_profiler.yaml
|           
+---database
|   +---data
|   |   |   ...
|   |   |   
|   |   +---mysql
|   |   |       ...
|   |           
|   \---init.sql
+---docker
|   +---apache
|   |       Dockerfile
|   |       start_server.sh
|   |       
|   \---database
|           Dockerfile
|           nodes_app_tree.sql
|           
+---migrations
|       .gitignore
|       Version20230531082340.php
|       
+---mysql
|   |   ...
|   |   
|   +---#innodb_redo
|   |       ...
|   |       
|   +---#innodb_temp
|   +---mysql
|   |       ...
|   |       
|   +---performance_schema
|   |       ...
|   |       
|   \---sys
|           sys_config.ibd
|           
+---node_modules
|   |   .package-lock.json
|	|	...
```
