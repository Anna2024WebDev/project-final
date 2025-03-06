import styled from "styled-components";

export const primaryFont = "Poppins";
export const secondaryFont = "Roboto"

// Heading 1
export const Title = styled.h1`
  font-family: ${primaryFont};
  font-size: 2.5rem;
  font-weight: 500;
  line-height: 1.2;
  margin-bottom: 1rem;
  color: #ffb7c5;
`;

// Heading 2
export const PageTitle = styled.h2`
  font-family: ${primaryFont};
  font-size: 2rem;
  font-weight: 400;
  line-height: 1.3;
  margin: 0; 
  color: #ffb7c5;
`;

//Heading 3
export const SubPageTitle = styled.h3`
font-family: ${primaryFont};
font-size: 1.6rem;
font-weight: 400;
line-height: 1.4;
color: #053332; 
 `;

// Paragraph text
export const Text = styled.p`
font-family: ${secondaryFont};
font-size: 1.2rem;
font-weight: 400;
line-height: 1.3;
color: #FFF;
`;

//Small text
export const SmallText = styled.span`
font-family: ${secondaryFont};
font-size: 0.9rem;
font-weight: 400;
line-height: 1.3;
color: #FFF;
`;  