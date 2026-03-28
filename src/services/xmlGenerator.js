  /**
  * WIPO ST.26 XML Generator
  * Converts FASTA sequence metadata into the standard XML format for patent applications.
  */
 
 export const XmlGenerator = {
     generateST26Xml(result) {
         const { metadata, timestamp, hash, natureCheck, tkStatus, noveltyCheck, biopiracyData } = result;
         const uuid = (hash || 'UNKNOWN').substring(0, 8).toUpperCase();
 
         const xml = `<?xml version="1.0" encoding="UTF-8"?>
 <!-- 
   BIOSPHERE ORIGIN LIABILITY SHIELD FINGERPRINT
   SHA-256: ${hash || 'PENDING'}
   TIMESTAMP: ${timestamp || new Date().toISOString()}
   JURISDICTION: India (SCOMET/NBA)
 -->
 <ST26SequenceListing 
     dtdVersion="1.3" 
     fileName="BioSphere_ST26_Report.xml" 
     softwareName="BioSphere Origin" 
     softwareVersion="2.1.0" 
     productionDate="${(timestamp || new Date().toISOString()).split('T')[0]}">
     <ApplicantFileReference>BP-${uuid}</ApplicantFileReference>
     <SequenceData sequenceNumber="1">
         <INSDSeq>
             <INSDSeq_length>${metadata.length || 0}</INSDSeq_length>
             <INSDSeq_moltype>DNA</INSDSeq_moltype>
             <INSDSeq_division>PHG</INSDSeq_division>
             <INSDSeq_feature-table>
                 <INSDFeature>
                     <INSDFeature_key>source</INSDFeature_key>
                     <INSDFeature_location>1..${metadata.length || 0}</INSDFeature_location>
                     <INSDFeature_quals>
                         <INSDQualifier>
                             <INSDQualifier_name>organism</INSDQualifier_name>
                             <INSDQualifier_value>Synthetic Construct</INSDQualifier_value>
                         </INSDQualifier>
                         <INSDQualifier>
                             <INSDQualifier_name>mol_type</INSDQualifier_name>
                             <INSDQualifier_value>other DNA</INSDQualifier_value>
                         </INSDQualifier>
                         <INSDQualifier>
                             <INSDQualifier_name>nature_check</INSDQualifier_name>
                             <INSDQualifier_value>${natureCheck?.isNatural ? 'REGULATED' : 'PASS'}</INSDQualifier_value>
                         </INSDQualifier>
                         <INSDQualifier>
                             <INSDQualifier_name>tk_safeguard</INSDQualifier_name>
                             <INSDQualifier_value>${tkStatus ? 'FLAGGED' : 'PASS'}</INSDQualifier_value>
                         </INSDQualifier>
                         <INSDQualifier>
                             <INSDQualifier_name>novelty_status</INSDQualifier_name>
                             <INSDQualifier_value>${noveltyCheck?.isNovel ? 'PASS' : 'RED'}</INSDQualifier_value>
                         </INSDQualifier>
                         <INSDQualifier>
                             <INSDQualifier_name>biopiracy_gate</INSDQualifier_name>
                             <INSDQualifier_value>${biopiracyData?.isTriggered ? 'REGULATED' : 'PASS'}</INSDQualifier_value>
                         </INSDQualifier>
                         <INSDQualifier>
                             <INSDQualifier_name>note</INSDQualifier_name>
                             <INSDQualifier_value>Liability Shield: ${hash || 'PENDING'}</INSDQualifier_value>
                         </INSDQualifier>
                     </INSDFeature_quals>
                 </INSDFeature>
             </INSDSeq_feature-table>
             <INSDSeq_sequence>${metadata.sequence?.toLowerCase() || ''}</INSDSeq_sequence>
         </INSDSeq>
     </SequenceData>
 </ST26SequenceListing>`;
 
         return xml;
     },
 
     downloadXml(result) {
         const xml = this.generateST26Xml(result);
         const blob = new Blob([xml], { type: 'application/xml;charset=utf-8' });
         const url = URL.createObjectURL(blob);
         
         const a = document.createElement('a');
         const dateStr = result.timestamp ? new Date(result.timestamp).toISOString().split('T')[0] : 'Report';
         const hashShort = result.hash ? result.hash.substring(0, 8).toUpperCase() : 'HASH';
         const fileName = `BioSphere_WIPO_${dateStr}_${hashShort}.xml`;
 
         a.href = url;
         a.setAttribute('download', fileName);
         a.style.display = 'none';
         
         document.body.appendChild(a);
         a.click();
 
         setTimeout(() => {
             document.body.removeChild(a);
             URL.revokeObjectURL(url);
         }, 500); // Increased safety delay
     }
 };
