import crypto from 'crypto';
import bcrypt from 'bcrypt';
import * as fs from 'fs';
import { Pool } from 'pg';
import { parentPort, workerData } from 'worker_threads';

const GENDER = ['Male', 'Female', 'Other'];

const MARITAL_STATUS = ['Single', 'Married'];

const ROLE = ['hr-manger', 'user'];

const positions = [
  {
    department: 'Engineering',
    jobTitles: [
      { title: 'Software Engineer' },
      { title: 'Frontend Developer' },
      { title: 'Backend Developer' },
    ],
  },

  {
    department: 'Human Resources',
    jobTitles: [
      { title: 'HR Manager' },
      { title: 'Recruiter' },
      { title: 'HR Executive' },
    ],
  },

  {
    department: 'Finance',
    jobTitles: [
      { title: 'Accountant' },
      { title: 'Financial Analyst' },
      { title: 'Finance Manager' },
    ],
  },

  {
    department: 'Marketing',
    jobTitles: [
      { title: 'Marketing Manager' },
      { title: 'SEO Specialist' },
      { title: 'Content Strategist' },
    ],
  },

  {
    department: 'Sales',
    jobTitles: [
      { title: 'Sales Executive' },
      { title: 'Business Development Manager' },
      { title: 'Sales Manager' },
    ],
  },

  {
    department: 'Operations',
    jobTitles: [
      { title: 'Operations Manager' },
      { title: 'Process Analyst' },
      { title: 'Operations Executive' },
    ],
  },

  {
    department: 'Customer Support',
    jobTitles: [
      { title: 'Support Executive' },
      { title: 'Customer Success Manager' },
      { title: 'Technical Support Engineer' },
    ],
  },

  {
    department: 'Information Technology',
    jobTitles: [
      { title: 'System Administrator' },
      { title: 'DevOps Engineer' },
      { title: 'Cloud Engineer' },
    ],
  },

  {
    department: 'Legal',
    jobTitles: [
      { title: 'Legal Advisor' },
      { title: 'Corporate Lawyer' },
      { title: 'Compliance Officer' },
    ],
  },

  {
    department: 'Administration',
    jobTitles: [
      { title: 'Admin Executive' },
      { title: 'Office Manager' },
      { title: 'Administrative Assistant' },
    ],
  },

  {
    department: 'Research and Development',
    jobTitles: [
      { title: 'Research Scientist' },
      { title: 'R&D Engineer' },
      { title: 'Innovation Manager' },
    ],
  },

  {
    department: 'Design',
    jobTitles: [
      { title: 'UI Designer' },
      { title: 'UX Designer' },
      { title: 'Graphic Designer' },
    ],
  },

  {
    department: 'Product Management',
    jobTitles: [
      { title: 'Product Manager' },
      { title: 'Associate Product Manager' },
      { title: 'Product Owner' },
    ],
  },

  {
    department: 'Quality Assurance',
    jobTitles: [
      { title: 'QA Engineer' },
      { title: 'Automation Tester' },
      { title: 'Test Lead' },
    ],
  },

  {
    department: 'Data Science',
    jobTitles: [
      { title: 'Data Scientist' },
      { title: 'Data Analyst' },
      { title: 'Machine Learning Engineer' },
    ],
  },
];

const JOB_TITLES = [
  'Software Engineer',
  'Senior Software Engineer',
  'Tech Lead',
  'Engineering Manager',
  'DevOps Engineer',
  'Backend Developer',
  'Frontend Developer',
  'QA Engineer',
  'HR Executive',
];

const countries = [
  {
    country: 'India',
    currency: 'INR',
    countryCode: '+91',
    states: [
      {
        state: 'Maharashtra',
        cities: [
          {
            city: 'Mumbai',
            zipCode: '400001',
          },
          {
            city: 'Pune',
            zipCode: '411001',
          },
          {
            city: 'Nagpur',
            zipCode: '440001',
          },
        ],
      },
      {
        state: 'Karnataka',
        cities: [
          {
            city: 'Bangalore',
            zipCode: '560001',
          },
          {
            city: 'Mysore',
            zipCode: '570001',
          },
          {
            city: 'Mangalore',
            zipCode: '575001',
          },
        ],
      },
    ],
  },

  {
    country: 'America',
    currency: 'USD',
    countryCode: '+1',
    states: [
      {
        state: 'California',
        cities: [
          {
            city: 'Los Angeles',
            zipCode: '90001',
          },
          {
            city: 'San Francisco',
            zipCode: '94101',
          },
          {
            city: 'San Diego',
            zipCode: '92101',
          },
        ],
      },
      {
        state: 'Texas',
        cities: [
          {
            city: 'Houston',
            zipCode: '77001',
          },
          {
            city: 'Dallas',
            zipCode: '75201',
          },
          {
            city: 'Austin',
            zipCode: '73301',
          },
        ],
      },
    ],
  },

  {
    country: 'Canada',
    currency: 'CAD',
    countryCode: '+1',
    states: [
      {
        state: 'Ontario',
        cities: [
          {
            city: 'Toronto',
            zipCode: 'M5H',
          },
          {
            city: 'Ottawa',
            zipCode: 'K1A',
          },
          {
            city: 'Hamilton',
            zipCode: 'L8P',
          },
        ],
      },
      {
        state: 'Alberta',
        cities: [
          {
            city: 'Calgary',
            zipCode: 'T1X',
          },
          {
            city: 'Edmonton',
            zipCode: 'T5A',
          },
          {
            city: 'Red Deer',
            zipCode: 'T4N',
          },
        ],
      },
    ],
  },

  {
    country: 'Australia',
    currency: 'AUD',
    countryCode: '+61',
    states: [
      {
        state: 'New South Wales',
        cities: [
          {
            city: 'Sydney',
            zipCode: '2000',
          },
          {
            city: 'Newcastle',
            zipCode: '2300',
          },
          {
            city: 'Wollongong',
            zipCode: '2500',
          },
        ],
      },
      {
        state: 'Victoria',
        cities: [
          {
            city: 'Melbourne',
            zipCode: '3000',
          },
          {
            city: 'Geelong',
            zipCode: '3220',
          },
          {
            city: 'Ballarat',
            zipCode: '3350',
          },
        ],
      },
    ],
  },

  {
    country: 'Germany',
    currency: 'EUR',
    countryCode: '+49',
    states: [
      {
        state: 'Bavaria',
        cities: [
          {
            city: 'Munich',
            zipCode: '80331',
          },
          {
            city: 'Nuremberg',
            zipCode: '90402',
          },
          {
            city: 'Augsburg',
            zipCode: '86150',
          },
        ],
      },
      {
        state: 'Berlin',
        cities: [
          {
            city: 'Berlin',
            zipCode: '10115',
          },
          {
            city: 'Spandau',
            zipCode: '13581',
          },
          {
            city: 'Pankow',
            zipCode: '13187',
          },
        ],
      },
    ],
  },

  {
    country: 'France',
    currency: 'EUR',
    countryCode: '+33',
    states: [
      {
        state: 'Île-de-France',
        cities: [
          {
            city: 'Paris',
            zipCode: '75001',
          },
          {
            city: 'Versailles',
            zipCode: '78000',
          },
          {
            city: 'Boulogne',
            zipCode: '92100',
          },
        ],
      },
      {
        state: 'Provence',
        cities: [
          {
            city: 'Marseille',
            zipCode: '13001',
          },
          {
            city: 'Nice',
            zipCode: '06000',
          },
          {
            city: 'Cannes',
            zipCode: '06400',
          },
        ],
      },
    ],
  },

  {
    country: 'Japan',
    currency: 'JPY',
    countryCode: '+81',
    states: [
      {
        state: 'Tokyo',
        cities: [
          {
            city: 'Shinjuku',
            zipCode: '160-0022',
          },
          {
            city: 'Shibuya',
            zipCode: '150-0002',
          },
          {
            city: 'Akihabara',
            zipCode: '101-0021',
          },
        ],
      },
      {
        state: 'Osaka',
        cities: [
          {
            city: 'Sakai',
            zipCode: '590-0078',
          },
          {
            city: 'Hirakata',
            zipCode: '573-0000',
          },
          {
            city: 'Takatsuki',
            zipCode: '569-0000',
          },
        ],
      },
    ],
  },
];

const randomItem = <T>(array: T[]) => {
  return array[Math.floor(Math.random() * array.length)];
};

const randomLocation = (countries: any) => {
  let randomCountry = Math.floor(Math.random() * countries.length);
  let country: {
    country: string;
    currency: string;
    countryCode: string;
    states: [
      {
        state: string;
        cities: [
          {
            city: string;
            zipCode: string;
          },
        ];
      },
    ];
  } = countries[randomCountry];
  let randomState = Math.floor(Math.random() * country?.states.length);
  let state: {
    state: string;
    cities: [
      {
        city: string;
        zipCode: string;
      },
    ];
  } = country?.states[randomState];
  const currency = country.currency;

  const randomCity = Math.floor(Math.random() * state?.cities.length);
  const city = state?.cities[randomCity];
  return {
    country: country.country,
    state: state.state,
    city: city.city,
    currency: currency,
    zipCode: city.zipCode,
    countryCode: country.countryCode,
  };
};

const randomPosition = (positions: any) => {
  let randomDepartment = Math.floor(Math.random() * positions.length);
  let department: {
    department: string;
    jobTitles: [
      {
        title: string;
      },
    ];
  } = positions[randomDepartment];
  let randomJobTitle = Math.floor(Math.random() * department.jobTitles.length);
  let jobTitle = department.jobTitles[randomJobTitle];
  return {
    department: department.department,
    jobTitle: jobTitle.title,
  };
};

const randomSalary = () => {
  return Math.floor(Math.random() * (2550000 - 300000) + 300000);
};

const randomDate = () => {
  const years = Array.from({ length: 26 }, (_, index) => 2000 + index);
  const start = new Date(years[Math.floor(Math.random() * years.length)], 0, 1);

  const end = new Date();

  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime()),
  )
    .toISOString()
    .split('T')[0];
};

const randomBirthDate = () => {
  const years = Array.from({ length: 25 }, (_, index) => 1975 + index);
  const start = new Date(years[Math.floor(Math.random() * years.length)], 0, 1);

  const end = new Date();

  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime()),
  )
    .toISOString()
    .split('T')[0];
};

const randomContactNumber = () => {
  const randomNumber = crypto.randomInt(1000000000, 9999999999);
  return randomNumber;
};
const generatePan = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';

  for (let i = 0; i < 10; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    result += chars[randomIndex];
  }
  return result;
};

const generatePassword = async (password) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  return hashedPassword;
};
const seedEmployees = async () => {
  const { host, port, user, password, database } = workerData;

  const pool = new Pool({
    host: host,
    port: Number(port),
    user: user,
    password: password,
    database: database,
  });
  try {
    const TOTAL_EMPLOYEES = 10000;

    const BATCH_SIZE = 500;

    console.log(`Generating ${TOTAL_EMPLOYEES} employees`);

    await pool.query('BEGIN');

    for (
      let batchStart = 0;
      batchStart < TOTAL_EMPLOYEES;
      batchStart += BATCH_SIZE
    ) {
      const values: any[] = [];
      // const valuesPersonDetails: any[] = [];
      // const valuesContactDetails: any[] = [];
      // const valuesAddressDetails: any[] = [];
      const valuesUser: any[] = [];

      const placeholders: string[] = [];
      // const placeholdersPersonDetails: any[] = [];
      // const placeholdersContactDetails: any[] = [];
      // const placeholdersAddressDetails: any[] = [];
      const placeholdersUser: any[] = [];

      let paramIndex = 1;
      // let paramIndexPersonDetails = 1;
      // let paramIndexContactDetails = 1;
      // let paramIndexAddressDetails = 1;
      let paramIndexUser = 1;

      console.log(
        `------- ${batchStart}, ${Math.min(batchStart + BATCH_SIZE, TOTAL_EMPLOYEES)}`,
      );
      const firstNames = fs
        .readFileSync('first.txt', 'utf8')
        .split('\n')
        .slice(batchStart, Math.min(batchStart + BATCH_SIZE, TOTAL_EMPLOYEES));

      const lastNames = fs
        .readFileSync('last.txt', 'utf8')
        .split('\n')
        .slice(batchStart, Math.min(batchStart + BATCH_SIZE, TOTAL_EMPLOYEES));
      for (
        let i = batchStart;
        i < Math.min(batchStart + BATCH_SIZE, TOTAL_EMPLOYEES);
        i++
      ) {
        const firstName: string = randomItem(firstNames);
        const lastName: string = randomItem(lastNames);
        const fullname = `${firstName} ${lastName}`;
        const employeeCode = `EMP${String(i + 1).padStart(5, '0')}`;
        const officialMail = `${firstName}.${lastName}${i}@company.com`;
        const personalEmail = `${firstName}.${lastName}${i}@personal.com`;
        const { country, state, city, currency, zipCode, countryCode } =
          randomLocation(countries);
        const { department, jobTitle } = randomPosition(positions);
        const onboardLocation = city;
        const salary = randomSalary();
        const joiningDate = randomDate();
        const gender = randomItem(GENDER);
        const maritalStatus = randomItem(MARITAL_STATUS);
        const age = Math.floor(Math.random() * (50 - 18) + 18);
        const birthDate = randomBirthDate();
        const pan = generatePan();
        const contanctNumber = randomContactNumber();
        const hashedPassword = await generatePassword(pan);

        let role = 'hr-manger';
        if (department != 'Human Resources') {
          role = 'user';
        }

        // For Employees Placeholder

        placeholders.push(`
        (
        $${paramIndex++},
        $${paramIndex++},
        $${paramIndex++},
        $${paramIndex++},
        $${paramIndex++},
        $${paramIndex++},
        $${paramIndex++},
        $${paramIndex++},
        $${paramIndex++},
        $${paramIndex++},
        $${paramIndex++},
        $${paramIndex++},
        $${paramIndex++},
        $${paramIndex++},
        $${paramIndex++},
        $${paramIndex++},
        $${paramIndex++},
        $${paramIndex++},
        $${paramIndex++},
        $${paramIndex++},
        $${paramIndex++},
        $${paramIndex++},
        NOW(),
        NOW()
      )
`);
        // For User Placeholder
        placeholdersUser.push(`
          (
            $${paramIndexUser++},
            $${paramIndexUser++},
            $${paramIndexUser++},
            $${paramIndexUser++},
            $${paramIndexUser++},
            NOW(),
            NOW()
        )`);

        // For Personal Details Placeholder
        // placeholdersPersonDetails.push(`
        //   (
        //   $${paramIndexPersonDetails++},
        //   $${paramIndexPersonDetails++},
        //   $${paramIndexPersonDetails++},
        //   $${paramIndexPersonDetails++},
        //   $${paramIndexPersonDetails++},
        //   $${paramIndexPersonDetails++},
        //   NOW(),
        //   NOW()
        //   )`);

        // For Contact Details Placeholder
        // placeholdersContactDetails.push(`
        //   (
        //     $${paramIndexContactDetails++},
        //     $${paramIndexContactDetails++},
        //     $${paramIndexContactDetails++},
        //     $${paramIndexContactDetails++},
        //     NOW(),
        //     NOW()
        //     )`);

        // For Address Details Placeholder
        // placeholdersAddressDetails.push(`
        //   // (
        //   // $${paramIndexAddressDetails++},
        //   // $${paramIndexAddressDetails++},
        //   // $${paramIndexAddressDetails++},
        //   // $${paramIndexAddressDetails++},
        //   // $${paramIndexAddressDetails++},
        //   // $${paramIndexAddressDetails++},
        //   // NOW(),
        //   // NOW()
        //   // )
        // `);

        // For values : Employees
        values.push(
          employeeCode,
          fullname,
          officialMail,
          onboardLocation,
          jobTitle,
          salary,
          joiningDate,
          department,
          country,
          `${city}, ${state}, ${country}`,
          city,
          state,
          zipCode,
          personalEmail,
          contanctNumber,
          countryCode,
          gender,
          maritalStatus,
          age,
          birthDate,
          pan,
          false,
        );

        // For values: User
        valuesUser.push(
          officialMail,
          hashedPassword,
          role,
          employeeCode,
          false,
        );

        // For Values: Personal Details
        // valuesPersonDetails.push(
        //   employeeCode,
        //   gender,
        //   maritalStatus,
        //   age,
        //   birthDate,
        //   pan,
        // );
        // For Values: contact Details
        // valuesContactDetails.push(
        //   employeeCode,
        //   personalEmail,
        //   contanctNumber,
        //   countryCode,
        // );

        // For Values: Employee Address
        //   valuesAddressDetails.push(
        //     employeeCode,
        //     `${city}, ${state}, ${country}`,
        //     city,
        //     state,
        //     country,
        //     zipCode,
        //   );
      }

      const query = `
        INSERT INTO employees (
          employee_code,
          fullname,
          official_mail,
          onboard_location,
          job_title,
          salary,
          date_of_joining,
          department,
          country,
          address_line,
          city,
          state,
          zip_code,
          personal_email,
          contact_number,
          country_code,
          gender,
          married_status,
          age,
          date_of_birth,
          pan_id,
          is_deleted,
          created_at,
          updated_at
        )
        VALUES
        ${placeholders.join(',')}
      `;

      const queryUser = `
        INSERT INTO users (
          email,
          password,
          role,
          employee_id,
          is_deleted,
          created_at,
          updated_at
        )
        VALUES
        ${placeholdersUser.join(',')}`;

      // const queryPersonDetails = `
      //   INSERT INTO employee_personal_details (
      //     employee_id,
      //     gender,
      //     married_status,
      //     age,
      //     date_of_birth,
      //     pan_id,
      //     created_at,
      //     updated_at
      //   )
      //   VALUES
      //   ${placeholdersPersonDetails.join(',')}`;

      // const queryContactDetails = `
      //   INSERT INTO employee_contact_details (
      //     employee_id,
      //     personal_email,
      //     contact_number,
      //     country_code,
      //     created_at,
      //     updated_at
      //   )
      //   VALUES
      //   ${placeholdersContactDetails.join(',')}`;

      // const queryAddressDetails = `
      //   INSERT INTO employee_addresses (
      //     employee_id,
      //     address_line,
      //     city,
      //     state,
      //     country,
      //     zip_code,
      //     created_at,
      //     updated_at
      //   )
      //   VALUES
      //   ${placeholdersAddressDetails.join(',')}`;

      await pool.query(query, values);
      await pool.query(queryUser, valuesUser);
      // await pool.query(queryPersonDetails, valuesPersonDetails);
      // await pool.query(queryContactDetails, valuesContactDetails);
      // await pool.query(queryAddressDetails, valuesAddressDetails);

      console.log(`Inserted batch ${batchStart / BATCH_SIZE + 1}`);
    }

    await pool.query('COMMIT');

    console.log('Employee seeding completed');
    parentPort?.postMessage({ success: true });
    await pool.end();
    process.exit(0);
  } catch (error) {
    await pool.query('ROLLBACK');
    parentPort?.postMessage({ success: false, error: error.message });
    console.error('Seeding failed:', error);

    process.exit(1);
  }
};

seedEmployees();
