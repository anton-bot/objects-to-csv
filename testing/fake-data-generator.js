const ObjectsToCsv = require('../index');
const { faker } = require('@faker-js/faker');

const setDataRowLength = 135000;


(async () => {

    const data = []
    for (let i = 0; i < setDataRowLength; i++) {
        let fakeObject = { 
            name:faker.name.fullName() , 
            email:faker.internet.email() , 
            company:faker.company.name(),
            phone:faker.phone.number('501-###-###')  , 
            hacker:faker.hacker.phrase()
        }
        data.push(fakeObject)
    }
    console.log(data.length)

    await new ObjectsToCsv(data).toDisk(
        `../out.csv`,
        { allColumns: true, append: false }
    );
  })();