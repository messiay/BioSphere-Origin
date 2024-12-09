from Bio.Seq import Seq
from Bio.SeqRecord import SeqRecord
from Bio import SeqFeature
from Bio.SeqFeature import SeqFeature, FeatureLocation
from Bio.Graphics import GenomeDiagram
from reportlab.lib.units import cm
from Bio import SearchIO
from Bio.Blast import NCBIXML
import sqlite3
from Bio.Seq import Seq
import concurrent.futures
import tkinter as tk
from PIL import Image, ImageTk
from tkinter import filedialog, simpledialog, messagebox
import matplotlib.pyplot as plt
from PIL import Image, ImageTk
import subprocess
import os


class BioSphere:
        def __init__(self):
                 self.root = tk.Tk()   
                 self.root.title("BioSphere - Genetic Analysis Platform")

        # Header Section
                 header_frame = tk.Frame(self.root)
                 header_frame.pack(fill="x")

        # Navigation Menu
                 navigation_menu = tk.Frame(header_frame)
                 navigation_menu.pack(side="right")
                 home_button = tk.Button(navigation_menu, text="Home")
                 home_button.pack(side="left")
                 sequence_analysis_button = tk.Button(navigation_menu, text="Sequence Analysis")
                 sequence_analysis_button.pack(side="left")
                 alignment_tools_button = tk.Button(navigation_menu, text="Alignment Tools")
                 alignment_tools_button.pack(side="left")
                 database_management_button = tk.Button(navigation_menu, text="Database Management")
                 database_management_button.pack(side="left")
                 help_button = tk.Button(navigation_menu, text="Help")
                 help_button.pack(side="left")


              # Sequence Analysis Section

                 sequence_analysis_frame = tk.Frame(self.root)
                 sequence_analysis_frame.pack(fill="both", expand=True)
 
                 sequence_analysis_label = tk.Label(sequence_analysis_frame, text="Sequence Analysis")
                 sequence_analysis_label.pack()
 
                 sequence_file_label = tk.Label(sequence_analysis_frame, text="Sequence File")
                 sequence_file_label.pack()
 
                 sequence_file_entry = tk.Entry(sequence_analysis_frame)  # add this line as well
                 sequence_file_entry.pack()  # and this line

    
            # Alignment Tools Section
                 alignment_tools_frame = tk.Frame(self.root)
                 alignment_tools_frame.pack(fill="both", expand=True)
                 blat_alignment_label = tk.Label(alignment_tools_frame, text="BLAT Alignment")
                 blat_alignment_label.pack()
                 genome_file_label = tk.Label(alignment_tools_frame, text="Genome File")
                 genome_file_label.pack()
                 genome_file_entry = tk.Entry(alignment_tools_frame, text="Sequence File")
                 sequence_file_label.pack()
                 sequence_file_entry = tk.Entry(alignment_tools_frame, width=50)
                 sequence_file_entry.pack()
                 sequence_file_browse_button = tk.Button(alignment_tools_frame, text="Browse", command=lambda: sequence_file_entry.insert(0, filedialog.askopenfilename()))
                 sequence_file_browse_button.pack()
     
                 alignment_button = tk.Button(alignment_tools_frame, text="Run Alignment", command=self.blat_alignment)
                 alignment_button.pack()

                 self.msa_thread = None
                 self.tree_thread = None
                 self.structure_thread = None
                 self.assembly_thread = None
                 self.visualization_thread = None
     
             # Bowtie Alignment
                 bowtie_alignment_label = tk.Label(alignment_tools_frame, text="Bowtie Alignment")
                 bowtie_alignment_label.pack()
                 bowtie_genome_index_label = tk.Label(alignment_tools_frame, text="Genome Index")
                 bowtie_genome_index_label.pack()
                 bowtie_genome_index_entry = tk.Entry(alignment_tools_frame, width=50)
                 bowtie_genome_index_entry.pack()
                 bowtie_genome_index_browse_button = tk.Button(alignment_tools_frame, text="Browse", command=lambda: bowtie_genome_index_entry.insert(0, filedialog.askopenfilename()))
                 bowtie_genome_index_browse_button.pack()
     
                 bowtie_sequence_file_label = tk.Label(alignment_tools_frame, text="Sequence File")
                 bowtie_sequence_file_label.pack()
                 bowtie_sequence_file_entry = tk.Entry(alignment_tools_frame, width=50)
                 bowtie_sequence_file_entry.pack()
                 bowtie_sequence_file_browse_button = tk.Button(alignment_tools_frame, text="Browse", command=lambda: bowtie_sequence_file_entry.insert(0, filedialog.askopenfilename()))
                 bowtie_sequence_file_browse_button.pack()   
 
                 bowtie_alignment_button = tk.Button(alignment_tools_frame, text="Run Bowtie Alignment", command=self.bowtie_alignment)
                 bowtie_alignment_button.pack()
 
         # Database Management Section
                 database_management_frame = tk.Frame(self.root)
                 database_management_frame.pack(fill="both", expand=True, pady=10)  # Added padding for better layout

                 database_connection_label = tk.Label(database_management_frame, text="Database Connection Details")
                 database_connection_label.pack(pady=5)  # Added padding between label and entry field

                 database_connection_frame = tk.Frame(database_management_frame)
                 database_connection_frame.pack(pady=5)

                 tk.Label(database_connection_frame, text="Host:").pack(side=tk.LEFT)
                 host_entry = tk.Entry(database_connection_frame, width=20)
                 host_entry.pack(side=tk.LEFT, padx=5)

                 tk.Label(database_connection_frame, text="Database:").pack(side=tk.LEFT, padx=10)
                 database_entry = tk.Entry(database_connection_frame, width=20)
                 database_entry.pack(side=tk.LEFT, padx=5)

                 tk.Label(database_connection_frame, text="Username:").pack(side=tk.LEFT, padx=10)
                 username_entry = tk.Entry(database_connection_frame, width=20)
                 username_entry.pack(side=tk.LEFT, padx=5)

                 tk.Label(database_connection_frame, text="Password:").pack(side=tk.LEFT, padx=10)
                 password_entry = tk.Entry(database_connection_frame, width=20, show="*")  # Hide password input
                 password_entry.pack(side=tk.LEFT, padx=5)

                 connect_button = tk.Button(database_management_frame, text="Connect to Database", command=self.save_to_database)
                 connect_button.pack(pady=10)
    
                 self.query_builder = QueryBuilder()  # Assuming QueryBuilder is a class.
                 self.root.after(0, self.configure_logo)  
                 self.root.mainloop()

        def configure_logo(self):
            try:
                logo_image = Image.open("C:\\Users\\ADMIN\\Desktop\\personal\\biosphere\\x.png")
                logo_image = ImageTk.PhotoImage(logo_image)
                logo_label = tk.Label(self.root, image=logo_image)
                logo_label.image = logo_image  
                logo_label.pack(side="left")
            except FileNotFoundError:
                print("Error: Logo image file not found.")
                # Optionally, display an error message in the GUI
                error_label = tk.Label(self.root, text="Logo image file not found.")
                error_label.pack()
            
        def create_database(self, db_name):
            conn = sqlite3.connect(f'{db_name}.sqlite')
            cursor = conn.cursor()
            cursor.execute("""CREATE TABLE IF NOT EXISTS sequences 
                          (id INTEGER PRIMARY KEY, sequence_text TEXT, complement TEXT)""")
            conn.commit()
            conn.close()
    
        def validate_sequence(self, file_path):
            try:
                with open(file_path, 'r') as file:
                    sequence_text = file.read().strip().replace("\n", "").replace(" ", "")
                    sequence = Seq(sequence_text)
                if not all(base in "ATCG" for base in sequence.upper()):
                    raise ValueError("Sequence contains invalid DNA characters.")
                sequence_complement = sequence.complement()
                return sequence_text, str(sequence_complement)
            except Exception as e:
                print("Invalid sequence:", str(e))
            return False
    

        def save_to_database(self, db_name, sequence_text, complement):
            conn = sqlite3.connect(f'{db_name}.sqlite')
            cursor = conn.cursor()
            cursor.execute("""INSERT INTO sequences (sequence_text, complement) VALUES (?, ?)""",
                           (sequence_text, complement))
            conn.commit()
            conn.close()

        def calculate_gc_content(self, sequence):
            gc_count = sequence.upper().count('G') + sequence.upper().count('C')
            total_count = len(sequence)
            gc_percentage = (gc_count / total_count) * 100
            return gc_percentage

        def query_database(self, db_name, query_type, query_value):
            conn = sqlite3.connect(f'{db_name}.sqlite')
            cursor = conn.cursor()
            if query_type == "sequence_id":
                cursor.execute(f"SELECT * FROM sequences WHERE id = '{query_value}'")
            elif query_type == "sequence_text":
                cursor.execute(f"SELECT * FROM sequences WHERE sequence_text LIKE '%{query_value}%'")
            rows = cursor.fetchall()
            conn.close()
            return rows

        def backup_database(self, db_name, backup_file):
            conn = sqlite3.connect(f'{db_name}.sqlite')
            with open(backup_file, 'w') as f:
                for line in conn.iterdump():
                    f.write('%s\n' % line)
            conn.close()

        def upload_sequence(self):
            file_path = filedialog.askopenfilename(title="Select Genetic Sequence File")
            if not file_path:
                print("No file selected")
                return
            db_name = simpledialog.askstring("Database", "Enter database name (or create new one)")
            if db_name:
                self.create_database(db_name)
            validation_result = self.validate_sequence(file_path)
            if validation_result:
                sequence_text, complement = validation_result
                self.save_to_database(db_name, sequence_text, complement)
                print("Sequence uploaded successfully!")
                self.label.config(text="Sequence Uploaded Successfully!")
                gc_content = self.calculate_gc_content(sequence_text)
                print("GC Content:", gc_content)
                alignment_result = self.blast_alignment(db_name, sequence_text)
                print("Alignment Result:", alignment_result[0].hits[0].description)
                gene_features = self.gene_annotation(sequence_text)
                print("Gene Annotation Features:", gene_features)
                predicted_protein = self.protein_sequence_prediction(sequence_text)
                print("Predicted Protein Sequence:", predicted_protein)
                self.sequence_visualization(sequence_text)

        def run(self):
            # GUI elements setup
            header = tk.Label(self.root, text="BioSphere", font=("Arial", 24))
            header.pack()

            subtitle = tk.Label(self.root, text="Upload Genetic Sequences for Analysis")
            subtitle.pack()

            self.label = tk.Label(self.root, text="")
            self.label.pack()

            upload_button = tk.Button(self.root, text="Upload Genetic Sequence", command=self.upload_sequence)
            upload_button.pack(pady=20)

            backup_button = tk.Button(self.root, text="Backup Database", command=self.backup_database_gui)
            backup_button.pack(pady=10)

            alignment_button = tk.Button(self.root, text="DNA Sequence Alignment", command=self.alignment_gui)
            alignment_button.pack(pady=10)

            annotation_button = tk.Button(self.root, text="Gene Annotation", command=self.annotation_gui)
            annotation_button.pack(pady=10)

            prediction_button = tk.Button(self.root, text="Protein Sequence Prediction", command=self.prediction_gui)
            prediction_button.pack(pady=10)

            visualization_button = tk.Button(self.root, text="Sequence Visualization", command=self.visualization_gui)
            visualization_button.pack(pady=10)

            blat_button = tk.Button(self.root, text="Run BLAT Alignment", command=self.blat_alignment_gui)
            blat_button.pack(pady=10)

            bowtie_button = tk.Button(self.root, text="Run Bowtie Alignment", command=self.bowtie_alignment_gui)
            bowtie_button.pack(pady=10)

            self.root.mainloop()

        def backup_database_gui(self):
            db_name = simpledialog.askstring("Database", "Enter database name")
            backup_file = filedialog.asksaveasfilename(title="Save Backup File", defaultextension=".sql")
            if db_name and backup_file:
                self.backup_database(db_name, backup_file)
                messagebox.showinfo("Backup Success", "Database backed up successfully!")

        def blast_alignment(self, db_name, sequence_text):
            if not db_name:
                raise ValueError("Database name is not provided or invalid.")
            query_file = 'query.fasta'
            with open(query_file, 'w') as output_file:
                output_file.write(f">query\n{sequence_text}")
            # Check for valid BLAST database
            blast_db_path = f"{db_name}"  # Ensure this path points to a valid BLAST DB
            if not os.path.exists(f"{blast_db_path}.nin"):  # Example: Check BLAST database files
                raise FileNotFoundError(f"BLAST database {blast_db_path} not found.")
            # Run BLAST
            blast_cmd = f"blastn -query {query_file} -db {blast_db_path} -outfmt 5 -out blast_output.xml"
            subprocess.run(blast_cmd, shell=True, check=True)
            from Bio.Blast import NCBIXML
            with open("blast_output.xml") as result_handle:
                blast_record = NCBIXML.read(result_handle)
            return blast_record


        def gene_annotation(self, sequence_text):
            features = []
            feature = SeqFeature(FeatureLocation(0, len(sequence_text)), type='gene')
            features.append(feature)
            return features

        def protein_sequence_prediction(self, sequence_text):
            cleaned_sequence = self.clean_sequence(sequence_text)
            while len(cleaned_sequence) % 3 != 0:
                cleaned_sequence += "N"
            sequence = Seq(cleaned_sequence)
            return sequence.translate()



        def clean_sequence(self, sequence):
            cleaned_sequence = sequence.strip().replace("", "").replace(" ", "").upper()
            valid_bases = {"A", "T", "C", "G"}
            if not all(base in valid_bases for base in cleaned_sequence):
                raise ValueError(f"Invalid character found in sequence: {sequence}")
            return cleaned_sequence



        def sequence_visualization(self, sequence_text):
            plt.plot([sequence_text.count(base) for base in 'ATCG'], marker='o')
            plt.xlabel('Base Type (A, T, C, G)')
            plt.ylabel('Base Count')
            plt.title('Base Count Visualization')
            plt.xticks(range(len('ATCG')), list('ATCG'))
            plt.show()

        def alignment_gui(self):
            db_name = simpledialog.askstring("Database", "Enter database name")
            sequence_text = simpledialog.askstring("Sequence", "Enter sequence text")
            result = self.blast_alignment(db_name, sequence_text)
            print("Alignment Result:", result[0].hits[0].description)

        def annotation_gui(self):
            sequence_text = simpledialog.askstring("Sequence", "Enter sequence text")
            gene_features = self.gene_annotation(sequence_text)
            print("Gene Annotation Features:", gene_features)

        def prediction_gui(self):
            sequence_text = simpledialog.askstring("Sequence", "Enter sequence text")
            try:
                predicted_protein = self.protein_sequence_prediction(sequence_text)
                messagebox.showinfo("Protein Prediction", f"Predicted Protein: {predicted_protein}")
            except ValueError as e:
                messagebox.showerror("Error", f"Invalid Sequence: {str(e)}")


        def visualization_gui(self):
            sequence_text = simpledialog.askstring("Sequence", "Enter sequence text")
            self.sequence_visualization(sequence_text)
            
        def run_blat(sequence_text, genome_file):
            blat_cmd = f"blat {genome_file} - -q=dna -t=dna -out=blast8"
            process = subprocess.Popen(blat_cmd, shell=True, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            output, error = process.communicate(input=sequence_text.encode())
            if error:
                print(f"BLAT error: {error.decode()}")
            return output.decode()
    
        def run_bowtie(sequence_file, genome_index):
            bowtie_cmd = f"bowtie -f {genome_index} {sequence_file} -S output.sam"
            process = subprocess.run(bowtie_cmd, shell=True, capture_output=True, text=True)
            if process.returncode != 0:
                print(f"Bowtie error: {process.stderr}")
            else:
                print("Bowtie alignment completed successfully!")
            return process.stdout

    
        def blat_alignment(self, sequence_text, genome_file):
            blat_result = self.blat_blat(sequence_text, genome_file)
            return blat_result

        def blat_alignment_gui(self):
            genome_file_path = filedialog.askopenfilename(title="Select Genome File")
            sequence_text = simpledialog.askstring("Sequence Text", "Enter sequence text")
            result = self.blat_alignment(sequence_text, genome_file_path)
            messagebox.showinfo("BLAT Alignment Result", result)

        def bowtie_alignment(self, sequence_file, genome_index):
            bowtie_cmd = f"bowtie -f {genome_index} {sequence_file} -S output.sam"
            subprocess.run(bowtie_cmd, shell=True)
            # parse output.sam file as needed
            with open("output.sam", 'r') as file:
                return file.read()
        
        def bowtie_alignment_gui(self):
            genome_index_path = filedialog.askopenfilename(title="Select Genome Index File")
            sequence_file_path = filedialog.asksaveasfilename(title="Save Sequence File for Bowtie", defaultextension=".fasta")
    
        def get_protein_amino_acids(self):
            return {"A", "R", "N", "D", "C", "E", "Q", "G", "H", "I", "L", "K", "M", "F", "P", "S", "T", "W", "Y", "V"}

        def validate_sequence(self, file_path, sequence_type):
            try:
                with open(file_path, 'r') as file:
                    sequence_text = file.read().strip().replace("", "").replace(" ", "").upper()
                if sequence_type == "DNA":
                    valid_bases = {"A", "T", "C", "G"}
                elif sequence_type == "RNA":
                    valid_bases = {"A", "C", "G", "U"}
                elif sequence_type == "PROTEIN":
                    valid_bases = self.get_protein_amino_acids()
                else:
                    raise ValueError("Invalid sequence type. Supported types: DNA, RNA, PROTEIN")
                if not all(base in valid_bases for base in sequence_text):
                    raise ValueError(f"Invalid character found in sequence: {sequence_text}")
                return sequence_text
            except Exception as e:
                print(f"Validation error: {str(e)}")
                return False

        def save_sequence_file(self, sequence_text, file_format):
            if file_format == "FASTA":
                with open("sequence.fasta", 'w') as file:
                    file.write(f">sequence {sequence_text}")
            elif file_format == "FASTQ":
                # implement FASTQ format saving (requires quality scores)
                pass
            elif file_format == "GenBank":
                # implement GenBank format saving
                pass
    
        def load_sequence_file(self, file_path):
            with open(file_path, 'r') as file:
                format = file.extension  # get file format from extension
                if format == "fasta":
                    return SeqIO.read(file, "fasta")
                elif format == "fastq":
                    return SeqIO.read(file, "fastq")
                # add more format handling as needed

        def upload_sequence(self):
            file_path = filedialog.askopenfilename(title="Select Genetic Sequence File")
            sequence_type = simpledialog.askstring("Sequence Type", "Enter sequence type (DNA/RNA)")
            validation_result = self.validate_sequence(file_path, sequence_type)
            if validation_result:
                sequence_text = validation_result
                genome_file = simpledialog.askstring("Genome File", "Enter genome file path for BLAT alignment")
                blat_result = self.blat_alignment(sequence_text, genome_file)
                print("BLAT Alignment Result:", blat_result)
                genome_index = simpledialog.askstring("Genome Index", "Enter genome index path for Bowtie alignment")
                sequence_file_path = filedialog.asksaveasfilename(title="Save Sequence File for Bowtie", defaultextension=".fasta")
                with open(sequence_file_path, 'w') as file:
                    file.write(f">sequence {sequence_text}")
                bowtie_result = self.bowtie_alignment(sequence_file_path, genome_index)
                print("Bowtie Alignment Result:", bowtie_result)

        def run_msa(self, sequences):
                # MSA algorithm implementation here
            print("MSA completed")

        def run_tree_construction(self, aligned_sequences):
        # Phylogenetic tree construction implementation here
            print("Tree construction completed")

        def run_structure_prediction(self, protein_sequence):
        # Protein structure prediction implementation here
            print("Structure prediction completed")

        def run_genome_assembly(self, reads):
        # Genome assembly implementation here
            print("Genome assembly completed")

        def run_visualization(self, data):
        # Data visualization implementation here
            print("Visualization completed")

        def run_simultaneously(self, sequences, aligned_sequences, protein_sequence, reads, data):
            with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
                self.msa_thread = executor.submit(self.run_msa, sequences)
                self.tree_thread = executor.submit(self.run_tree_construction, aligned_sequences)
                self.structure_thread = executor.submit(self.run_structure_prediction, protein_sequence)
                self.assembly_thread = executor.submit(self.run_genome_assembly, reads)
                self.visualization_thread = executor.submit(self.run_visualization, data)

            # Retrieve results from threads (if needed)
                msa_result = self.msa_thread.result()
                tree_result = self.tree_thread.result()
                structure_result = self.structure_thread.result()
                assembly_result = self.assembly_thread.result()
                visualization_result = self.visualization_thread.result()
    
                print("All tasks completed")

            
# Run the BioSphere application
if __name__ == "__main__":
    app = BioSphere()
