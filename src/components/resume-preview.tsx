import React, { forwardRef } from "react";

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  linkedin: string;
  skills: string;
  certifications?: string;
  extraCurriculars?: string;
  references?: string;
  tenthGradeMarks?: string;
  twelfthGradeMarks?: string;
  cgpa?: string;
  experience: { title: string; company: string; description: string }[];
  projects?: { name: string; description: string }[];
  education: { degree: string }[];
}

export const ResumePreview = forwardRef<HTMLDivElement, { profile: ProfileData | null, pagesToggle: "1" | "auto" }>((props, ref) => {
  const p = props.profile;
  const pagesToggle = props.pagesToggle;
  if (!p) return <div className="hidden"><div ref={ref}></div></div>;

  return (
    <div className="hidden">
      <div 
        ref={ref} 
        className={`bg-white text-black p-10 font-sans mx-auto shadow-sm ${pagesToggle === "1" ? "overflow-hidden" : ""}`}
        style={{ 
          width: "210mm", 
          minHeight: "297mm", 
          maxHeight: pagesToggle === "1" ? "297mm" : "none",
          margin: 0, 
          boxSizing: "border-box" 
        }}
      >
        <header className="mb-6 flex flex-col items-center border-b border-gray-300 pb-4">
          <h1 className="text-3xl font-bold uppercase tracking-wide mb-1">{p.firstName} {p.lastName}</h1>
          <div className="flex flex-wrap justify-center gap-2 md:gap-4 text-sm text-gray-600">
            {p.email && <span>{p.email}</span>}
            {p.email && (p.phone || p.linkedin) && <span>•</span>}
            {p.phone && <span>{p.phone}</span>}
            {p.phone && p.linkedin && <span>•</span>}
            {p.linkedin && <span>{p.linkedin}</span>}
          </div>
        </header>

        {p.experience && p.experience.length > 0 && p.experience[0].title && (
          <section className="mb-6">
            <h2 className="text-lg font-bold uppercase tracking-wider text-gray-800 border-b border-gray-300 mb-3 pb-1">Experience</h2>
            
            {p.experience.map((exp, i) => (
              <div key={i} className="mb-4">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-semibold text-gray-900">{exp.title}</h3>
                </div>
                <p className="text-sm font-medium text-gray-700 mb-2">{exp.company}</p>
                <div className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                  {exp.description}
                </div>
              </div>
            ))}
          </section>
        )}

        {p.projects && p.projects.length > 0 && p.projects[0].name && (
          <section className="mb-6">
            <h2 className="text-lg font-bold uppercase tracking-wider text-gray-800 border-b border-gray-300 mb-3 pb-1">Projects</h2>
            
            {p.projects.map((proj, i) => (
              <div key={i} className="mb-4">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-semibold text-gray-900">{proj.name}</h3>
                </div>
                <div className="text-sm text-gray-700 whitespace-pre-line leading-relaxed mt-1">
                  {proj.description}
                </div>
              </div>
            ))}
          </section>
        )}

        {p.education && p.education.length > 0 && p.education[0].degree && (
          <section className="mb-6">
            <h2 className="text-lg font-bold uppercase tracking-wider text-gray-800 border-b border-gray-300 mb-3 pb-1">Education</h2>
            {p.education.map((edu, i) => (
              <div key={i} className="mb-2">
                <h3 className="font-semibold text-gray-900">{edu.degree}</h3>
              </div>
            ))}
            
            {(p.tenthGradeMarks || p.twelfthGradeMarks || p.cgpa) && (
              <div className="mt-3 flex gap-6 text-sm text-gray-700">
                {p.tenthGradeMarks && <div><span className="font-semibold text-gray-800">10th Grade:</span> {p.tenthGradeMarks}</div>}
                {p.twelfthGradeMarks && <div><span className="font-semibold text-gray-800">12th Grade:</span> {p.twelfthGradeMarks}</div>}
                {p.cgpa && <div><span className="font-semibold text-gray-800">CGPA:</span> {p.cgpa}</div>}
              </div>
            )}
          </section>
        )}

        {p.skills && (
          <section className="mb-6">
            <h2 className="text-lg font-bold uppercase tracking-wider text-gray-800 border-b border-gray-300 mb-3 pb-1">Skills</h2>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
              {p.skills}
            </p>
          </section>
        )}
        
        {p.certifications && (
          <section className="mb-6">
            <h2 className="text-lg font-bold uppercase tracking-wider text-gray-800 border-b border-gray-300 mb-3 pb-1">Certifications</h2>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
              {p.certifications}
            </p>
          </section>
        )}
        
        {p.extraCurriculars && (
          <section className="mb-6">
            <h2 className="text-lg font-bold uppercase tracking-wider text-gray-800 border-b border-gray-300 mb-3 pb-1">Extra Curriculars</h2>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
              {p.extraCurriculars}
            </p>
          </section>
        )}
        
        {p.references && (
          <section className="mb-6">
            <h2 className="text-lg font-bold uppercase tracking-wider text-gray-800 border-b border-gray-300 mb-3 pb-1">References</h2>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
              {p.references}
            </p>
          </section>
        )}
      </div>
    </div>
  );
});

ResumePreview.displayName = "ResumePreview";
