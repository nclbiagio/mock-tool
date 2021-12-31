
export const getMockPath = (projectName: string, f
   eature: string, serviceId: string) => {
   if (feature) {
      return `projects/${projectName}/mock/${feature}/${serviceId}.json`;
   }
   return `projects/${projectName}/mock/${serviceId}.json`;
};
