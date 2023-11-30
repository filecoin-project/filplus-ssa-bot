# Filplus SSA Bot
Welcome to the "Filplus SSA Bot" (Subsequent Allocation Bot) repository. This bot is an integral part of the Filplus program, specifically designed to enhance the efficiency and effectiveness of the Large Dataset Notaries (LDN) program.

## Overview
The Filplus SSA Bot, written in <code>TypeScript</code>, plays a crucial role in managing the allocation of datacap within the LDN program. It is programmed to automatically launch every 12 hours, performing a thorough scan of all active datacap requests. For those requests where more than 75% of the allocated datacap in the last tranche has been consumed, the bot initiates the process of assigning a new tranche.

## Key Features
- **Automated Scanning**: Every 12 hours, the bot scans all active datacap requests within the LDN program.
- **Tranche Allocation**: When a request has consumed over 75% of its last allocated datacap, the bot triggers the allocation of a new tranche.
- **Notary Approval**: Each new tranche allocation must be proposed and approved by two different notaries to ensure fairness and transparency.

# Related Projects
- [Fil+ Backend](https://github.com/filecoin-project/filplus-backend)
- [Fil+ Registry](https://github.com/filecoin-project/filplus-registry)
- [Fil+ Application Repository (Falcon)](https://github.com/filecoin-project/filecoin-plus-falcon)

## Contribution
As an open-source project, we welcome and encourage the community to contribute to the Filplus SSA Bot. Your insights and improvements are valuable to us. Here's how you can contribute:

- **Fork the Repository**: Start by forking the repository to your GitHub account.
- **Clone the Forked Repository**: Clone it to your local machine for development purposes.
- **Create a New Branch**: Always create a new branch for your changes.
- **Make Your Changes**: Implement your features, bug fixes, or improvements.
- **Commit Your Changes**: Make sure to write clear, concise commit messages.
- **Push to Your Fork**: Push your changes to your forked repository.
- **Create a Pull Request**: Submit a pull request from your forked repository to our main repository.

Please read through our <code>CONTRIBUTING.md</code> file for detailed instructions on how to contribute.

## Usage
This bot is specifically designed as a part of the Filplus program and is not intended for general installation or standalone use. Its primary function is to automate certain processes within the LDN program, contributing to the overall efficiency and effectiveness of datacap allocation.

## Support and Community
If you have any questions, suggestions, or need assistance, please reach out to our community channels. We strive to build a welcoming and supportive environment for all our contributors and users.

## License
This project is open-sourced under MIT. We believe in the power of open source and encourage the community to help us improve and maintain this project.