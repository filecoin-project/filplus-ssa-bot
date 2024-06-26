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

Please read through our [CONTRIBUTING.md](CONTRIBUTING.md) file for detailed instructions on how to contribute.

## Usage

This bot is specifically designed as a part of the Filplus program and is not intended for general installation or standalone use. Its primary function is to automate certain processes within the LDN program, contributing to the overall efficiency and effectiveness of datacap allocation.

## Support and Community

If you have any questions, suggestions, or need assistance, please reach out to our community channels. We strive to build a welcoming and supportive environment for all our contributors and users.

## License

This project is dual-licensed under the `Permissive License Stack`, which means you can choose to use the project under either:

- The Apache License 2.0, which is a free and open-source license, focusing on patent rights and copyright notices. For more details, see the [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0).

- The MIT License, a permissive and open-source license, known for its broad permissions and limited restrictions. For more details, see the [MIT License](https://opensource.org/licenses/MIT).

You may not use the contents of this repository except in compliance with one of these licenses. For an extended clarification of the intent behind the choice of licensing, please refer to the `LICENSE` file in this repository or visit [Permissive License Stack Explanation](https://protocol.ai/blog/announcing-the-permissive-license-stack/).

For the full license text, please see the [LICENSE](LICENSE) file in this repository.
