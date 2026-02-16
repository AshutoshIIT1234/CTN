import { DataSource } from 'typeorm';
import { College } from '../../entities/college.entity';

export async function seedColleges(dataSource: DataSource) {
  const collegeRepository = dataSource.getRepository(College);

  const colleges = [
    {
      name: 'Harvard University',
      emailDomain: 'harvard.edu',
      logoUrl: 'https://example.com/harvard-logo.png'
    },
    {
      name: 'Stanford University',
      emailDomain: 'stanford.edu',
      logoUrl: 'https://example.com/stanford-logo.png'
    },
    {
      name: 'Massachusetts Institute of Technology',
      emailDomain: 'mit.edu',
      logoUrl: 'https://example.com/mit-logo.png'
    },
    {
      name: 'University of California, Berkeley',
      emailDomain: 'berkeley.edu',
      logoUrl: 'https://example.com/berkeley-logo.png'
    },
    {
      name: 'Yale University',
      emailDomain: 'yale.edu',
      logoUrl: 'https://example.com/yale-logo.png'
    },
    {
      name: 'Princeton University',
      emailDomain: 'princeton.edu',
      logoUrl: 'https://example.com/princeton-logo.png'
    },
    {
      name: 'Columbia University',
      emailDomain: 'columbia.edu',
      logoUrl: 'https://example.com/columbia-logo.png'
    },
    {
      name: 'University of Chicago',
      emailDomain: 'uchicago.edu',
      logoUrl: 'https://example.com/uchicago-logo.png'
    }
  ];

  const savedColleges = [];
  
  for (const collegeData of colleges) {
    // Check if college already exists
    const existingCollege = await collegeRepository.findOne({
      where: { emailDomain: collegeData.emailDomain }
    });

    if (!existingCollege) {
      const college = collegeRepository.create(collegeData);
      const savedCollege = await collegeRepository.save(college);
      savedColleges.push(savedCollege);
      console.log(`Created college: ${savedCollege.name}`);
    } else {
      savedColleges.push(existingCollege);
      console.log(`College already exists: ${existingCollege.name}`);
    }
  }

  return savedColleges;
}