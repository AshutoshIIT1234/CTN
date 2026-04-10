import { DataSource } from 'typeorm';
import { College } from '../../entities/college.entity';

export async function seedColleges(dataSource: DataSource) {
  const collegeRepository = dataSource.getRepository(College);

  const colleges = [
    // IITs
    { name: 'Indian Institute of Technology, Bombay', emailDomain: 'iitb.ac.in', logoUrl: 'https://upload.wikimedia.org/wikipedia/en/1/1d/Indian_Institute_of_Technology_Bombay_Logo.svg' },
    { name: 'Indian Institute of Technology, Delhi', emailDomain: 'iitd.ac.in', logoUrl: 'https://upload.wikimedia.org/wikipedia/en/f/fd/Indian_Institute_of_Technology_Delhi_Logo.svg' },
    { name: 'Indian Institute of Technology, Madras', emailDomain: 'iitm.ac.in', logoUrl: 'https://upload.wikimedia.org/wikipedia/en/6/69/IIT_Madras_Logo.svg' },
    { name: 'Indian Institute of Technology, Kanpur', emailDomain: 'iitk.ac.in', logoUrl: 'https://upload.wikimedia.org/wikipedia/en/a/a3/IIT_Kanpur_Logo.svg' },
    { name: 'Indian Institute of Technology, Kharagpur', emailDomain: 'iitkgp.ac.in', logoUrl: 'https://upload.wikimedia.org/wikipedia/en/1/1c/IIT_Kharagpur_Logo.svg' },
    { name: 'Indian Institute of Technology, Roorkee', emailDomain: 'iitr.ac.in', logoUrl: 'https://upload.wikimedia.org/wikipedia/en/6/6f/Indian_Institute_of_Technology_Roorkee_logo.svg' },
    { name: 'Indian Institute of Technology, Guwahati', emailDomain: 'iitg.ac.in', logoUrl: 'https://upload.wikimedia.org/wikipedia/en/1/12/IIT_Guwahati_Logo.svg' },
    { name: 'Indian Institute of Technology, Hyderabad', emailDomain: 'iith.ac.in', logoUrl: 'https://upload.wikimedia.org/wikipedia/en/e/e1/Indian_Institute_of_Technology_Hyderabad_logo.png' },

    // IIMs
    { name: 'Indian Institute of Management, Ahmedabad', emailDomain: 'iima.ac.in', logoUrl: 'https://upload.wikimedia.org/wikipedia/en/a/a0/Indian_Institute_of_Management_Ahmedabad_logo.png' },
    { name: 'Indian Institute of Management, Bangalore', emailDomain: 'iimb.ac.in', logoUrl: 'https://upload.wikimedia.org/wikipedia/en/5/5e/Indian_Institute_of_Management_Bangalore_logo.png' },
    { name: 'Indian Institute of Management, Calcutta', emailDomain: 'iimcal.ac.in', logoUrl: 'https://upload.wikimedia.org/wikipedia/en/5/5a/Indian_Institute_of_Management_Calcutta_logo.png' },
    { name: 'Indian Institute of Management, Lucknow', emailDomain: 'iiml.ac.in', logoUrl: 'https://upload.wikimedia.org/wikipedia/en/8/8b/Indian_Institute_of_Management_Lucknow_logo.png' },
    { name: 'Indian Institute of Management, Indore', emailDomain: 'iimidr.ac.in', logoUrl: 'https://upload.wikimedia.org/wikipedia/en/b/b7/Indian_Institute_of_Management_Indore_logo.png' },
    { name: 'Indian Institute of Management, Kozhikode', emailDomain: 'iimk.ac.in', logoUrl: 'https://upload.wikimedia.org/wikipedia/en/a/a2/Indian_Institute_of_Management_Kozhikode_logo.png' },

    // AIIMS
    { name: 'All India Institute of Medical Sciences, Delhi', emailDomain: 'aiims.edu', logoUrl: 'https://upload.wikimedia.org/wikipedia/en/b/b5/All_India_Institute_of_Medical_Sciences_Delhi_logo.png' },
    { name: 'All India Institute of Medical Sciences, Jodhpur', emailDomain: 'aiimsjodhpur.edu.in', logoUrl: 'https://upload.wikimedia.org/wikipedia/en/0/0e/All_India_Institute_of_Medical_Sciences_Jodhpur_logo.png' },
    { name: 'All India Institute of Medical Sciences, Rishikesh', emailDomain: 'aiimsrishikesh.edu.in', logoUrl: 'https://upload.wikimedia.org/wikipedia/en/c/cf/All_India_Institute_of_Medical_Sciences_Rishikesh_logo.png' },
    { name: 'All India Institute of Medical Sciences, Bhopal', emailDomain: 'aiimsbhopal.edu.in', logoUrl: 'https://upload.wikimedia.org/wikipedia/en/d/dc/All_India_Institute_of_Medical_Sciences_Bhopal_logo.png' },

    // NITs
    { name: 'National Institute of Technology, Trichy', emailDomain: 'nitt.edu', logoUrl: 'https://upload.wikimedia.org/wikipedia/en/a/a5/NIT_Trichy_logo.png' },
    { name: 'National Institute of Technology, Karnataka', emailDomain: 'nitk.edu.in', logoUrl: 'https://upload.wikimedia.org/wikipedia/en/f/f3/National_Institute_of_Technology_Karnataka_logo.png' },
    { name: 'National Institute of Technology, Rourkela', emailDomain: 'nitrkl.ac.in', logoUrl: 'https://upload.wikimedia.org/wikipedia/en/8/8a/National_Institute_of_Technology_Rourkela_logo.png' },
    { name: 'National Institute of Technology, Warangal', emailDomain: 'nitw.ac.in', logoUrl: 'https://upload.wikimedia.org/wikipedia/en/0/0d/National_Institute_of_Technology_Warangal_logo.png' },
    { name: 'National Institute of Technology, Calicut', emailDomain: 'nitc.ac.in', logoUrl: 'https://upload.wikimedia.org/wikipedia/en/b/b5/National_Institute_of_Technology_Calicut_logo.png' },

    // IIITs
    { name: 'Indian Institute of Information Technology, Allahabad', emailDomain: 'iiita.ac.in', logoUrl: 'https://upload.wikimedia.org/wikipedia/en/2/2e/Indian_Institute_of_Information_Technology%2C_Allahabad_logo.png' },
    { name: 'Indian Institute of Information Technology, Hyderabad', emailDomain: 'iiit.ac.in', logoUrl: 'https://upload.wikimedia.org/wikipedia/en/d/d7/IIIT_Hyderabad_logo.png' },
    { name: 'Indian Institute of Information Technology, Gwalior', emailDomain: 'iiitm.ac.in', logoUrl: 'https://upload.wikimedia.org/wikipedia/en/d/d5/IIITM_Gwalior_logo.png' },
    { name: 'Indian Institute of Information Technology, Lucknow', emailDomain: 'iiitl.ac.in', logoUrl: 'https://upload.wikimedia.org/wikipedia/en/c/c8/IIIT_Lucknow_logo.png' },
    { name: 'Indian Institute of Information Technology, Bangalore', emailDomain: 'iiitb.ac.in', logoUrl: 'https://upload.wikimedia.org/wikipedia/en/b/b5/IIIT_Bangalore_logo.png' }
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