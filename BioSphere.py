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
import tkinter as tk
from tkinter import filedialog, simpledialog, messagebox
import matplotlib.pyplot as plt
import subprocess
import os


class BioSphere:
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("BioSphere - Genetic Innovation Hub")

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

# Run the BioSphere application
if __name__ == "__main__":
    app = BioSphere()
    app.run()
