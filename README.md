# Baserad på 2.1
Api'n har migrerat ifrån sql till mongodb (nosql documentmetodik) och använder sig av mongoose för att hantera datan. Detta har lett till bortagningen av en stor del funktioner och kod då separata och långa
mysql kallningar inte längre behövs. Kör på porten 3000 men hämtar mongodb på .env port eller 27017. Databasen har problemsökts med hjälp av mongodb compass. Apin är precis som förra en enkel CRUD api men enda skillnaden är ett byte av databas,
har tagits bort mer kod än det tillagts. Behandlar data i samma format som tidiagare, beskrivs även nedan.

## Operationer
### /data returnerar allt inehåll ifrån databasen (GET)
### /data/specific låter dig skicka ett fullt mysql anrop, används inte i uppgiften efter men den finns (GET)
### /remove tar bort ett inlägg som delar numret som skickas med ett object som inehåller remove: NUMBER (DELETE)
### /update Updaterar inehållet inom en rad i databasen baserat på ett nytt object skickat som följer formfaktorn {id: num, companyname: name, jobtitle: name, startdate: date, enddate: date}, måste överstemma med existerande id (PUT)
### /add lägger till ett nytt inlägg i databasen såvida den följer samma formfaktor som ovan (POST)

