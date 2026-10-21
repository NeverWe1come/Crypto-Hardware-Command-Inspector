/**
 * @packageDocumentation
 * Auto-generated Atalla AT1000 v8.60 command specifications extracted from the official manual.
 */

import type { CommandSpec } from '@chci/parser-core';

export const atallaV860Commands: CommandSpec[] = [
  {
    "id": "atalla-101-req",
    "code": "101",
    "direction": "request",
    "pairedCode": "201",
    "name": {
      "es": "Configure HSM Option (Petición)",
      "en": "Configure HSM Option (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 101: Configure HSM Option",
      "en": "Atalla AT1000 Command 101: Configure HSM Option"
    },
    "description": {
      "es": "Ejecuta la operación de Configure HSM Option en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Configure HSM Option operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Administración y Opciones",
      "en": "Administration & Options"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Configure HSM Option",
          "en": "Fields and parameters for Configure HSM Option"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "notes": [
      {
        "es": "[CAUTION] CAUTION: Enabling on option 44 degrades performance.",
        "en": "[CAUTION] CAUTION: Enabling on option 44 degrades performance."
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 101 (Configure HSM Option)"
  },
  {
    "id": "atalla-102-req",
    "code": "102",
    "direction": "request",
    "pairedCode": "202",
    "name": {
      "es": "Command Monitoring (Petición)",
      "en": "Command Monitoring (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 102: Command Monitoring",
      "en": "Atalla AT1000 Command 102: Command Monitoring"
    },
    "description": {
      "es": "Ejecuta la operación de Command Monitoring en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Command Monitoring operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Diagnóstico y Sistema",
      "en": "Diagnostics & System"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Command Monitoring",
          "en": "Fields and parameters for Command Monitoring"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "notes": [
      {
        "es": "[NOTE] NOTE: This command is only allowed on the serial port and the TCPIP management ports.",
        "en": "[NOTE] NOTE: This command is only allowed on the serial port and the TCPIP management ports."
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 102 (Command Monitoring)"
  },
  {
    "id": "atalla-105-req",
    "code": "105",
    "direction": "request",
    "pairedCode": "205",
    "name": {
      "es": "Install a license (Petición)",
      "en": "Install a license (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 105: Install a license",
      "en": "Atalla AT1000 Command 105: Install a license"
    },
    "description": {
      "es": "Ejecuta la operación de Install a license en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Install a license operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Administración y Opciones",
      "en": "Administration & Options"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Install a license",
          "en": "Fields and parameters for Install a license"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "notes": [
      {
        "es": "[NOTE] NOTE: This example does not enable any additional functionality.",
        "en": "[NOTE] NOTE: This example does not enable any additional functionality."
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 105 (Install a license)"
  },
  {
    "id": "atalla-106-req",
    "code": "106",
    "direction": "request",
    "pairedCode": "206",
    "name": {
      "es": "Define Temporary Serial Number (Petición)",
      "en": "Define Temporary Serial Number (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 106: Define Temporary Serial Number",
      "en": "Atalla AT1000 Command 106: Define Temporary Serial Number"
    },
    "description": {
      "es": "Ejecuta la operación de Define Temporary Serial Number en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Define Temporary Serial Number operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Administración y Opciones",
      "en": "Administration & Options"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Define Temporary Serial Number",
          "en": "Fields and parameters for Define Temporary Serial Number"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "notes": [
      {
        "es": "[NOTE] NOTE: This command is deprecated. Use the SCA Set Temporary Serial Number feature to install a temporary",
        "en": "[NOTE] NOTE: This command is deprecated. Use the SCA Set Temporary Serial Number feature to install a temporary"
      },
      {
        "es": "[NOTE] serial number.",
        "en": "[NOTE] serial number."
      },
      {
        "es": "[CAUTION] CAUTION: This temporary serial number is valid for 120 hours (5 days) from the time that the temporary serial",
        "en": "[CAUTION] CAUTION: This temporary serial number is valid for 120 hours (5 days) from the time that the temporary serial"
      },
      {
        "es": "[CAUTION] number was set in the HSM. For example, if the HSM receives the temporary serial number on Wednesday at",
        "en": "[CAUTION] number was set in the HSM. For example, if the HSM receives the temporary serial number on Wednesday at"
      },
      {
        "es": "[CAUTION] 6:30 AM, the temporary serial number will expire at 6:00AM on Monday. If the HSM does not receive a",
        "en": "[CAUTION] 6:30 AM, the temporary serial number will expire at 6:00AM on Monday. If the HSM does not receive a"
      },
      {
        "es": "[CAUTION] command 105 based on its permanent serial number within 120 hours, all customer-specific",
        "en": "[CAUTION] command 105 based on its permanent serial number within 120 hours, all customer-specific"
      },
      {
        "es": "[CAUTION] commands and options are disabled. To prevent this from happening, you must perform these two steps",
        "en": "[CAUTION] commands and options are disabled. To prevent this from happening, you must perform these two steps"
      },
      {
        "es": "[CAUTION] within this 120 hour time period:",
        "en": "[CAUTION] within this 120 hour time period:"
      },
      {
        "es": "[CAUTION] 1) Contact Atalla technical support and provide the serial numbers of the failed and replacement HSM. They",
        "en": "[CAUTION] 1) Contact Atalla technical support and provide the serial numbers of the failed and replacement HSM. They"
      },
      {
        "es": "[CAUTION] will generate a new command 105 based on the replacement HSM’s serial number.",
        "en": "[CAUTION] will generate a new command 105 based on the replacement HSM’s serial number."
      },
      {
        "es": "[CAUTION] 2) Send this new command 105 to the HSM.",
        "en": "[CAUTION] 2) Send this new command 105 to the HSM."
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 106 (Define Temporary Serial Number)"
  },
  {
    "id": "atalla-107-req",
    "code": "107",
    "direction": "request",
    "pairedCode": "207",
    "name": {
      "es": "Confirm Temporary Serial Number (Petición)",
      "en": "Confirm Temporary Serial Number (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 107: Confirm Temporary Serial Number",
      "en": "Atalla AT1000 Command 107: Confirm Temporary Serial Number"
    },
    "description": {
      "es": "Ejecuta la operación de Confirm Temporary Serial Number en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Confirm Temporary Serial Number operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Administración y Opciones",
      "en": "Administration & Options"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Confirm Temporary Serial Number",
          "en": "Fields and parameters for Confirm Temporary Serial Number"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "notes": [
      {
        "es": "[NOTE] NOTE: This command is deprecated. Use the SCA Set Temporary Serial Number feature to install a temporary",
        "en": "[NOTE] NOTE: This command is deprecated. Use the SCA Set Temporary Serial Number feature to install a temporary"
      },
      {
        "es": "[NOTE] serial number.",
        "en": "[NOTE] serial number."
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 107 (Confirm Temporary Serial Number)"
  },
  {
    "id": "atalla-108-req",
    "code": "108",
    "direction": "request",
    "pairedCode": "208",
    "name": {
      "es": "Define Security Policy (Petición)",
      "en": "Define Security Policy (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 108: Define Security Policy",
      "en": "Atalla AT1000 Command 108: Define Security Policy"
    },
    "description": {
      "es": "Ejecuta la operación de Define Security Policy en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Define Security Policy operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Administración y Opciones",
      "en": "Administration & Options"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Define Security Policy",
          "en": "Fields and parameters for Define Security Policy"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "notes": [
      {
        "es": "[NOTE] NOTE: This command is deprecated. Use the SCA HSM Configuration Management feature to configure the",
        "en": "[NOTE] NOTE: This command is deprecated. Use the SCA HSM Configuration Management feature to configure the"
      },
      {
        "es": "[NOTE] HSM security policy.",
        "en": "[NOTE] HSM security policy."
      },
      {
        "es": "[CAUTION] CAUTION: Once the count value reaches zero, the HSM will return an error <00#0300xx#> instead of",
        "en": "[CAUTION] CAUTION: Once the count value reaches zero, the HSM will return an error <00#0300xx#> instead of"
      },
      {
        "es": "[CAUTION] processing the command. The command <9A#COUNT#> provides the current count value for all commands in",
        "en": "[CAUTION] processing the command. The command <9A#COUNT#> provides the current count value for all commands in"
      },
      {
        "es": "[CAUTION] the command count table.",
        "en": "[CAUTION] the command count table."
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 108 (Define Security Policy)"
  },
  {
    "id": "atalla-109-req",
    "code": "109",
    "direction": "request",
    "pairedCode": "209",
    "name": {
      "es": "Confirm Security Policy (Petición)",
      "en": "Confirm Security Policy (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 109: Confirm Security Policy",
      "en": "Atalla AT1000 Command 109: Confirm Security Policy"
    },
    "description": {
      "es": "Ejecuta la operación de Confirm Security Policy en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Confirm Security Policy operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Administración y Opciones",
      "en": "Administration & Options"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Confirm Security Policy",
          "en": "Fields and parameters for Confirm Security Policy"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "notes": [
      {
        "es": "[NOTE] NOTE: This command is deprecated. Use the SCA HSM Configuration Management feature to configure the",
        "en": "[NOTE] NOTE: This command is deprecated. Use the SCA HSM Configuration Management feature to configure the"
      },
      {
        "es": "[NOTE] HSM security policy.",
        "en": "[NOTE] HSM security policy."
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 109 (Confirm Security Policy)"
  },
  {
    "id": "atalla-11-req",
    "code": "11",
    "direction": "request",
    "pairedCode": "21",
    "name": {
      "es": "Export a Working Key in AKB Format (Petición)",
      "en": "Export a Working Key in AKB Format (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 11: Export a Working Key in AKB Format",
      "en": "Atalla AT1000 Command 11: Export a Working Key in AKB Format"
    },
    "description": {
      "es": "Ejecuta la operación de Export a Working Key in AKB Format en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Export a Working Key in AKB Format operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Gestión de Claves",
      "en": "Key Management"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Export a Working Key in AKB Format",
          "en": "Fields and parameters for Export a Working Key in AKB Format"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 11 (Export a Working Key in AKB Format)"
  },
  {
    "id": "atalla-1100-req",
    "code": "1100",
    "direction": "request",
    "pairedCode": "2100",
    "name": {
      "es": "HSM Extended Software Version (Petición)",
      "en": "HSM Extended Software Version (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 1100: HSM Extended Software Version",
      "en": "Atalla AT1000 Command 1100: HSM Extended Software Version"
    },
    "description": {
      "es": "Ejecuta la operación de HSM Extended Software Version en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes HSM Extended Software Version operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Diagnóstico y Sistema",
      "en": "Diagnostics & System"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para HSM Extended Software Version",
          "en": "Fields and parameters for HSM Extended Software Version"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 1100 (HSM Extended Software Version)"
  },
  {
    "id": "atalla-1101-req",
    "code": "1101",
    "direction": "request",
    "pairedCode": "2101",
    "name": {
      "es": "HSM Software Version (Petición)",
      "en": "HSM Software Version (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 1101: HSM Software Version",
      "en": "Atalla AT1000 Command 1101: HSM Software Version"
    },
    "description": {
      "es": "Ejecuta la operación de HSM Software Version en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes HSM Software Version operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Diagnóstico y Sistema",
      "en": "Diagnostics & System"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para HSM Software Version",
          "en": "Fields and parameters for HSM Software Version"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 1101 (HSM Software Version)"
  },
  {
    "id": "atalla-1102-req",
    "code": "1102",
    "direction": "request",
    "pairedCode": "2102",
    "name": {
      "es": "HSM Domain Information (Petición)",
      "en": "HSM Domain Information (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 1102: HSM Domain Information",
      "en": "Atalla AT1000 Command 1102: HSM Domain Information"
    },
    "description": {
      "es": "Ejecuta la operación de HSM Domain Information en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes HSM Domain Information operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Diagnóstico y Sistema",
      "en": "Diagnostics & System"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para HSM Domain Information",
          "en": "Fields and parameters for HSM Domain Information"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "notes": [
      {
        "es": "[NOTE] NOTE: This command is only allowed on the serial port and the TCPIP management ports.",
        "en": "[NOTE] NOTE: This command is only allowed on the serial port and the TCPIP management ports."
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 1102 (HSM Domain Information)"
  },
  {
    "id": "atalla-1104-req",
    "code": "1104",
    "direction": "request",
    "pairedCode": "2104",
    "name": {
      "es": "HSM Temporary Serial Number Information (Petición)",
      "en": "HSM Temporary Serial Number Information (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 1104: HSM Temporary Serial Number Information",
      "en": "Atalla AT1000 Command 1104: HSM Temporary Serial Number Information"
    },
    "description": {
      "es": "Ejecuta la operación de HSM Temporary Serial Number Information en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes HSM Temporary Serial Number Information operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Diagnóstico y Sistema",
      "en": "Diagnostics & System"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para HSM Temporary Serial Number Information",
          "en": "Fields and parameters for HSM Temporary Serial Number Information"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 1104 (HSM Temporary Serial Number Information)"
  },
  {
    "id": "atalla-1105-req",
    "code": "1105",
    "direction": "request",
    "pairedCode": "2105",
    "name": {
      "es": "Install a License in all Domains (Petición)",
      "en": "Install a License in all Domains (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 1105: Install a License in all Domains",
      "en": "Atalla AT1000 Command 1105: Install a License in all Domains"
    },
    "description": {
      "es": "Ejecuta la operación de Install a License in all Domains en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Install a License in all Domains operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Administración y Opciones",
      "en": "Administration & Options"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Install a License in all Domains",
          "en": "Fields and parameters for Install a License in all Domains"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "notes": [
      {
        "es": "[NOTE] NOTE: After sending the command 1105 to the HSM, use the SCA to enable the customer-specific commands",
        "en": "[NOTE] NOTE: After sending the command 1105 to the HSM, use the SCA to enable the customer-specific commands"
      },
      {
        "es": "[NOTE] and options in each of the Domains. This command must be sent to Domain0.",
        "en": "[NOTE] and options in each of the Domains. This command must be sent to Domain0."
      },
      {
        "es": "[NOTE] NOTE: This is not a valid example.",
        "en": "[NOTE] NOTE: This is not a valid example."
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 1105 (Install a License in all Domains)"
  },
  {
    "id": "atalla-1110-req",
    "code": "1110",
    "direction": "request",
    "pairedCode": "2110",
    "name": {
      "es": "HSM System Configuration Information (Petición)",
      "en": "HSM System Configuration Information (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 1110: HSM System Configuration Information",
      "en": "Atalla AT1000 Command 1110: HSM System Configuration Information"
    },
    "description": {
      "es": "Ejecuta la operación de HSM System Configuration Information en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes HSM System Configuration Information operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Diagnóstico y Sistema",
      "en": "Diagnostics & System"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para HSM System Configuration Information",
          "en": "Fields and parameters for HSM System Configuration Information"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 1110 (HSM System Configuration Information)"
  },
  {
    "id": "atalla-1111-req",
    "code": "1111",
    "direction": "request",
    "pairedCode": "2111",
    "name": {
      "es": "HSM System Date and Time (Petición)",
      "en": "HSM System Date and Time (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 1111: HSM System Date and Time",
      "en": "Atalla AT1000 Command 1111: HSM System Date and Time"
    },
    "description": {
      "es": "Ejecuta la operación de HSM System Date and Time en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes HSM System Date and Time operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Diagnóstico y Sistema",
      "en": "Diagnostics & System"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para HSM System Date and Time",
          "en": "Fields and parameters for HSM System Date and Time"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 1111 (HSM System Date and Time)"
  },
  {
    "id": "atalla-1113-req",
    "code": "1113",
    "direction": "request",
    "pairedCode": "2113",
    "name": {
      "es": "HSM Average CPU Utilization (Petición)",
      "en": "HSM Average CPU Utilization (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 1113: HSM Average CPU Utilization",
      "en": "Atalla AT1000 Command 1113: HSM Average CPU Utilization"
    },
    "description": {
      "es": "Ejecuta la operación de HSM Average CPU Utilization en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes HSM Average CPU Utilization operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Diagnóstico y Sistema",
      "en": "Diagnostics & System"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para HSM Average CPU Utilization",
          "en": "Fields and parameters for HSM Average CPU Utilization"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 1113 (HSM Average CPU Utilization)"
  },
  {
    "id": "atalla-1120-req",
    "code": "1120",
    "direction": "request",
    "pairedCode": "2120",
    "name": {
      "es": "HSM System Information (Petición)",
      "en": "HSM System Information (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 1120: HSM System Information",
      "en": "Atalla AT1000 Command 1120: HSM System Information"
    },
    "description": {
      "es": "Ejecuta la operación de HSM System Information en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes HSM System Information operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Diagnóstico y Sistema",
      "en": "Diagnostics & System"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para HSM System Information",
          "en": "Fields and parameters for HSM System Information"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 1120 (HSM System Information)"
  },
  {
    "id": "atalla-113-req",
    "code": "113",
    "direction": "request",
    "pairedCode": "213",
    "name": {
      "es": "Change 3DES Encryption Mode (Petición)",
      "en": "Change 3DES Encryption Mode (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 113: Change 3DES Encryption Mode",
      "en": "Atalla AT1000 Command 113: Change 3DES Encryption Mode"
    },
    "description": {
      "es": "Ejecuta la operación de Change 3DES Encryption Mode en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Change 3DES Encryption Mode operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Operaciones Criptográficas",
      "en": "Cryptographic Operations"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Change 3DES Encryption Mode",
          "en": "Fields and parameters for Change 3DES Encryption Mode"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 113 (Change 3DES Encryption Mode)"
  },
  {
    "id": "atalla-117-req",
    "code": "117",
    "direction": "request",
    "pairedCode": "217",
    "name": {
      "es": "Import TR-31 Formatted Working Key (Petición)",
      "en": "Import TR-31 Formatted Working Key (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 117: Import TR-31 Formatted Working Key",
      "en": "Atalla AT1000 Command 117: Import TR-31 Formatted Working Key"
    },
    "description": {
      "es": "Ejecuta la operación de Import TR-31 Formatted Working Key en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Import TR-31 Formatted Working Key operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Gestión de Claves",
      "en": "Key Management"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Import TR-31 Formatted Working Key",
          "en": "Fields and parameters for Import TR-31 Formatted Working Key"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "notes": [
      {
        "es": "[NOTE] NOTE: For new applications, and applications required to import a key with optional block identifiers, Utimaco",
        "en": "[NOTE] NOTE: For new applications, and applications required to import a key with optional block identifiers, Utimaco"
      },
      {
        "es": "[NOTE] recommends the use of command 119 instead of this command.",
        "en": "[NOTE] recommends the use of command 119 instead of this command."
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 117 (Import TR-31 Formatted Working Key)"
  },
  {
    "id": "atalla-118-req",
    "code": "118",
    "direction": "request",
    "pairedCode": "218",
    "name": {
      "es": "Export Working Key in TR-31 Format (Petición)",
      "en": "Export Working Key in TR-31 Format (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 118: Export Working Key in TR-31 Format",
      "en": "Atalla AT1000 Command 118: Export Working Key in TR-31 Format"
    },
    "description": {
      "es": "Ejecuta la operación de Export Working Key in TR-31 Format en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Export Working Key in TR-31 Format operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Gestión de Claves",
      "en": "Key Management"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Export Working Key in TR-31 Format",
          "en": "Fields and parameters for Export Working Key in TR-31 Format"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "notes": [
      {
        "es": "[NOTE] NOTE: For new applications, and existing applications which are required to export a key with optional block",
        "en": "[NOTE] NOTE: For new applications, and existing applications which are required to export a key with optional block"
      },
      {
        "es": "[NOTE] identifiers, Utimaco recommends the use of command 11A instead of this command.",
        "en": "[NOTE] identifiers, Utimaco recommends the use of command 11A instead of this command."
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 118 (Export Working Key in TR-31 Format)"
  },
  {
    "id": "atalla-119-req",
    "code": "119",
    "direction": "request",
    "pairedCode": "219",
    "name": {
      "es": "Import TR-31 Formatted Working Key, versions A, B or C (Petición)",
      "en": "Import TR-31 Formatted Working Key, versions A, B or C (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 119: Import TR-31 Formatted Working Key, versions A, B or C",
      "en": "Atalla AT1000 Command 119: Import TR-31 Formatted Working Key, versions A, B or C"
    },
    "description": {
      "es": "Ejecuta la operación de Import TR-31 Formatted Working Key, versions A, B or C en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Import TR-31 Formatted Working Key, versions A, B or C operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Diagnóstico y Sistema",
      "en": "Diagnostics & System"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Import TR-31 Formatted Working Key, versions A, B or C",
          "en": "Fields and parameters for Import TR-31 Formatted Working Key, versions A, B or C"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 119 (Import TR-31 Formatted Working Key, versions A, B or C)"
  },
  {
    "id": "atalla-11a-req",
    "code": "11A",
    "direction": "request",
    "pairedCode": "21A",
    "name": {
      "es": "Export Working Key in TR-31 Format, versions A, B or C (Petición)",
      "en": "Export Working Key in TR-31 Format, versions A, B or C (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 11A: Export Working Key in TR-31 Format, versions A, B or C",
      "en": "Atalla AT1000 Command 11A: Export Working Key in TR-31 Format, versions A, B or C"
    },
    "description": {
      "es": "Ejecuta la operación de Export Working Key in TR-31 Format, versions A, B or C en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Export Working Key in TR-31 Format, versions A, B or C operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Diagnóstico y Sistema",
      "en": "Diagnostics & System"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Export Working Key in TR-31 Format, versions A, B or C",
          "en": "Fields and parameters for Export Working Key in TR-31 Format, versions A, B or C"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 11A (Export Working Key in TR-31 Format, versions A, B or C)"
  },
  {
    "id": "atalla-11b-req",
    "code": "11B",
    "direction": "request",
    "pairedCode": "21B",
    "name": {
      "es": "Import Non-AKB Formatted Working Keys (Petición)",
      "en": "Import Non-AKB Formatted Working Keys (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 11B: Import Non-AKB Formatted Working Keys",
      "en": "Atalla AT1000 Command 11B: Import Non-AKB Formatted Working Keys"
    },
    "description": {
      "es": "Ejecuta la operación de Import Non-AKB Formatted Working Keys en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Import Non-AKB Formatted Working Keys operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Gestión de Claves",
      "en": "Key Management"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Import Non-AKB Formatted Working Keys",
          "en": "Fields and parameters for Import Non-AKB Formatted Working Keys"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 11B (Import Non-AKB Formatted Working Keys)"
  },
  {
    "id": "atalla-11c-req",
    "code": "11C",
    "direction": "request",
    "pairedCode": "21C",
    "name": {
      "es": "Convert Atalla DES Key to 3DES or AMK AKB Format (Petición)",
      "en": "Convert Atalla DES Key to 3DES or AMK AKB Format (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 11C: Convert Atalla DES Key to 3DES or AMK AKB Format",
      "en": "Atalla AT1000 Command 11C: Convert Atalla DES Key to 3DES or AMK AKB Format"
    },
    "description": {
      "es": "Ejecuta la operación de Convert Atalla DES Key to 3DES or AMK AKB Format en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Convert Atalla DES Key to 3DES or AMK AKB Format operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Gestión de Claves",
      "en": "Key Management"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Convert Atalla DES Key to 3DES or AMK AKB Format",
          "en": "Fields and parameters for Convert Atalla DES Key to 3DES or AMK AKB Format"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "notes": [
      {
        "es": "[CAUTION] CAUTION: Once the count value reaches zero, the HSM will return an error <00#0300xx#> instead of",
        "en": "[CAUTION] CAUTION: Once the count value reaches zero, the HSM will return an error <00#0300xx#> instead of"
      },
      {
        "es": "[CAUTION] processing the command. The command <9A#COUNT#> will return the current count value for all commands",
        "en": "[CAUTION] processing the command. The command <9A#COUNT#> will return the current count value for all commands"
      },
      {
        "es": "[CAUTION] in the command count table.",
        "en": "[CAUTION] in the command count table."
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 11C (Convert Atalla DES Key to 3DES or AMK AKB Format)"
  },
  {
    "id": "atalla-11d-req",
    "code": "11D",
    "direction": "request",
    "pairedCode": "21D",
    "name": {
      "es": "Generate a Working Key (Petición)",
      "en": "Generate a Working Key (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 11D: Generate a Working Key",
      "en": "Atalla AT1000 Command 11D: Generate a Working Key"
    },
    "description": {
      "es": "Ejecuta la operación de Generate a Working Key en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Generate a Working Key operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Gestión de Claves",
      "en": "Key Management"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Generate a Working Key",
          "en": "Fields and parameters for Generate a Working Key"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 11D (Generate a Working Key)"
  },
  {
    "id": "atalla-11e-req",
    "code": "11E",
    "direction": "request",
    "pairedCode": "21E",
    "name": {
      "es": "Generate Atalla 2x2 PVN (Petición)",
      "en": "Generate Atalla 2x2 PVN (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 11E: Generate Atalla 2x2 PVN",
      "en": "Atalla AT1000 Command 11E: Generate Atalla 2x2 PVN"
    },
    "description": {
      "es": "Ejecuta la operación de Generate Atalla 2x2 PVN en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Generate Atalla 2x2 PVN operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Operaciones Criptográficas",
      "en": "Cryptographic Operations"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Generate Atalla 2x2 PVN",
          "en": "Fields and parameters for Generate Atalla 2x2 PVN"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "notes": [
      {
        "es": "[CAUTION] CAUTION: This command processes a clear PIN, it creates a significant security exposure.",
        "en": "[CAUTION] CAUTION: This command processes a clear PIN, it creates a significant security exposure."
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 11E (Generate Atalla 2x2 PVN)"
  },
  {
    "id": "atalla-120-req",
    "code": "120",
    "direction": "request",
    "pairedCode": "220",
    "name": {
      "es": "Generate Asymmetric Key Pair (Petición)",
      "en": "Generate Asymmetric Key Pair (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 120: Generate Asymmetric Key Pair",
      "en": "Atalla AT1000 Command 120: Generate Asymmetric Key Pair"
    },
    "description": {
      "es": "Ejecuta la operación de Generate Asymmetric Key Pair en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Generate Asymmetric Key Pair operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Gestión de Claves",
      "en": "Key Management"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Generate Asymmetric Key Pair",
          "en": "Fields and parameters for Generate Asymmetric Key Pair"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 120 (Generate Asymmetric Key Pair)"
  },
  {
    "id": "atalla-1200-req",
    "code": "1200",
    "direction": "request",
    "pairedCode": "2200",
    "name": {
      "es": "HSM Compliance Information (Petición)",
      "en": "HSM Compliance Information (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 1200: HSM Compliance Information",
      "en": "Atalla AT1000 Command 1200: HSM Compliance Information"
    },
    "description": {
      "es": "Ejecuta la operación de HSM Compliance Information en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes HSM Compliance Information operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Diagnóstico y Sistema",
      "en": "Diagnostics & System"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para HSM Compliance Information",
          "en": "Fields and parameters for HSM Compliance Information"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 1200 (HSM Compliance Information)"
  },
  {
    "id": "atalla-1204-req",
    "code": "1204",
    "direction": "request",
    "pairedCode": "2204",
    "name": {
      "es": "HSM Log Signing Key Certificate (Petición)",
      "en": "HSM Log Signing Key Certificate (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 1204: HSM Log Signing Key Certificate",
      "en": "Atalla AT1000 Command 1204: HSM Log Signing Key Certificate"
    },
    "description": {
      "es": "Ejecuta la operación de HSM Log Signing Key Certificate en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes HSM Log Signing Key Certificate operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Gestión de Claves",
      "en": "Key Management"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para HSM Log Signing Key Certificate",
          "en": "Fields and parameters for HSM Log Signing Key Certificate"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "notes": [
      {
        "es": "[NOTE] NOTE: This command is only available when the HSM is operating in PCI-HSM mode.",
        "en": "[NOTE] NOTE: This command is only available when the HSM is operating in PCI-HSM mode."
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 1204 (HSM Log Signing Key Certificate)"
  },
  {
    "id": "atalla-1205-req",
    "code": "1205",
    "direction": "request",
    "pairedCode": "2205",
    "name": {
      "es": "Verify Audit Log Record (Petición)",
      "en": "Verify Audit Log Record (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 1205: Verify Audit Log Record",
      "en": "Atalla AT1000 Command 1205: Verify Audit Log Record"
    },
    "description": {
      "es": "Ejecuta la operación de Verify Audit Log Record en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Verify Audit Log Record operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Operaciones Criptográficas",
      "en": "Cryptographic Operations"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Verify Audit Log Record",
          "en": "Fields and parameters for Verify Audit Log Record"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "notes": [
      {
        "es": "[NOTE] NOTE: This command is only available when the HSM is operating in PCI-HSM mode.",
        "en": "[NOTE] NOTE: This command is only available when the HSM is operating in PCI-HSM mode."
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 1205 (Verify Audit Log Record)"
  },
  {
    "id": "atalla-121-req",
    "code": "121",
    "direction": "request",
    "pairedCode": "221",
    "name": {
      "es": "Load RSA Key into RSA Key Table (Petición)",
      "en": "Load RSA Key into RSA Key Table (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 121: Load RSA Key into RSA Key Table",
      "en": "Atalla AT1000 Command 121: Load RSA Key into RSA Key Table"
    },
    "description": {
      "es": "Ejecuta la operación de Load RSA Key into RSA Key Table en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Load RSA Key into RSA Key Table operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Gestión de Claves",
      "en": "Key Management"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Load RSA Key into RSA Key Table",
          "en": "Fields and parameters for Load RSA Key into RSA Key Table"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 121 (Load RSA Key into RSA Key Table)"
  },
  {
    "id": "atalla-1216-req",
    "code": "1216",
    "direction": "request",
    "pairedCode": "2216",
    "name": {
      "es": "HSM Battery Status (Petición)",
      "en": "HSM Battery Status (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 1216: HSM Battery Status",
      "en": "Atalla AT1000 Command 1216: HSM Battery Status"
    },
    "description": {
      "es": "Ejecuta la operación de HSM Battery Status en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes HSM Battery Status operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Operaciones Criptográficas",
      "en": "Cryptographic Operations"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para HSM Battery Status",
          "en": "Fields and parameters for HSM Battery Status"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 1216 (HSM Battery Status)"
  },
  {
    "id": "atalla-122-req",
    "code": "122",
    "direction": "request",
    "pairedCode": "222",
    "name": {
      "es": "Generate RSA-AKB for Root Public Key (Petición)",
      "en": "Generate RSA-AKB for Root Public Key (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 122: Generate RSA-AKB for Root Public Key",
      "en": "Atalla AT1000 Command 122: Generate RSA-AKB for Root Public Key"
    },
    "description": {
      "es": "Ejecuta la operación de Generate RSA-AKB for Root Public Key en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Generate RSA-AKB for Root Public Key operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Gestión de Claves",
      "en": "Key Management"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Generate RSA-AKB for Root Public Key",
          "en": "Fields and parameters for Generate RSA-AKB for Root Public Key"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "notes": [
      {
        "es": "[NOTE] NOTE: This command is deprecated, new applications should use command 12A.",
        "en": "[NOTE] NOTE: This command is deprecated, new applications should use command 12A."
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 122 (Generate RSA-AKB for Root Public Key)"
  },
  {
    "id": "atalla-1221-req",
    "code": "1221",
    "direction": "request",
    "pairedCode": "2221",
    "name": {
      "es": "HSM IP Address (Petición)",
      "en": "HSM IP Address (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 1221: HSM IP Address",
      "en": "Atalla AT1000 Command 1221: HSM IP Address"
    },
    "description": {
      "es": "Ejecuta la operación de HSM IP Address en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes HSM IP Address operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Operaciones Criptográficas",
      "en": "Cryptographic Operations"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para HSM IP Address",
          "en": "Fields and parameters for HSM IP Address"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 1221 (HSM IP Address)"
  },
  {
    "id": "atalla-1222-req",
    "code": "1222",
    "direction": "request",
    "pairedCode": "2222",
    "name": {
      "es": "HSM Port Numbers (Petición)",
      "en": "HSM Port Numbers (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 1222: HSM Port Numbers",
      "en": "Atalla AT1000 Command 1222: HSM Port Numbers"
    },
    "description": {
      "es": "Ejecuta la operación de HSM Port Numbers en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes HSM Port Numbers operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Operaciones Criptográficas",
      "en": "Cryptographic Operations"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para HSM Port Numbers",
          "en": "Fields and parameters for HSM Port Numbers"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 1222 (HSM Port Numbers)"
  },
  {
    "id": "atalla-1223-req",
    "code": "1223",
    "direction": "request",
    "pairedCode": "2223",
    "name": {
      "es": "HSM TCP/IP Socket Information (Petición)",
      "en": "HSM TCP/IP Socket Information (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 1223: HSM TCP/IP Socket Information",
      "en": "Atalla AT1000 Command 1223: HSM TCP/IP Socket Information"
    },
    "description": {
      "es": "Ejecuta la operación de HSM TCP/IP Socket Information en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes HSM TCP/IP Socket Information operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Diagnóstico y Sistema",
      "en": "Diagnostics & System"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para HSM TCP/IP Socket Information",
          "en": "Fields and parameters for HSM TCP/IP Socket Information"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 1223 (HSM TCP/IP Socket Information)"
  },
  {
    "id": "atalla-1224-req",
    "code": "1224",
    "direction": "request",
    "pairedCode": "2224",
    "name": {
      "es": "HSM Remote Connections (Petición)",
      "en": "HSM Remote Connections (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 1224: HSM Remote Connections",
      "en": "Atalla AT1000 Command 1224: HSM Remote Connections"
    },
    "description": {
      "es": "Ejecuta la operación de HSM Remote Connections en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes HSM Remote Connections operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Operaciones Criptográficas",
      "en": "Cryptographic Operations"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para HSM Remote Connections",
          "en": "Fields and parameters for HSM Remote Connections"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 1224 (HSM Remote Connections)"
  },
  {
    "id": "atalla-1225-req",
    "code": "1225",
    "direction": "request",
    "pairedCode": "2225",
    "name": {
      "es": "HSM MAC Addresses (Petición)",
      "en": "HSM MAC Addresses (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 1225: HSM MAC Addresses",
      "en": "Atalla AT1000 Command 1225: HSM MAC Addresses"
    },
    "description": {
      "es": "Ejecuta la operación de HSM MAC Addresses en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes HSM MAC Addresses operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Autenticación y MAC",
      "en": "Authentication & MAC"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para HSM MAC Addresses",
          "en": "Fields and parameters for HSM MAC Addresses"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 1225 (HSM MAC Addresses)"
  },
  {
    "id": "atalla-1226-req",
    "code": "1226",
    "direction": "request",
    "pairedCode": "2226",
    "name": {
      "es": "HSM Key Check Digits (Petición)",
      "en": "HSM Key Check Digits (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 1226: HSM Key Check Digits",
      "en": "Atalla AT1000 Command 1226: HSM Key Check Digits"
    },
    "description": {
      "es": "Ejecuta la operación de HSM Key Check Digits en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes HSM Key Check Digits operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Gestión de Claves",
      "en": "Key Management"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para HSM Key Check Digits",
          "en": "Fields and parameters for HSM Key Check Digits"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 1226 (HSM Key Check Digits)"
  },
  {
    "id": "atalla-1227-req",
    "code": "1227",
    "direction": "request",
    "pairedCode": "2227",
    "name": {
      "es": "Reset HSM to Factory State (Petición)",
      "en": "Reset HSM to Factory State (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 1227: Reset HSM to Factory State",
      "en": "Atalla AT1000 Command 1227: Reset HSM to Factory State"
    },
    "description": {
      "es": "Ejecuta la operación de Reset HSM to Factory State en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Reset HSM to Factory State operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Operaciones Criptográficas",
      "en": "Cryptographic Operations"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Reset HSM to Factory State",
          "en": "Fields and parameters for Reset HSM to Factory State"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "notes": [
      {
        "es": "[NOTE] NOTE: This command is only allowed on the serial port.",
        "en": "[NOTE] NOTE: This command is only allowed on the serial port."
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 1227 (Reset HSM to Factory State)"
  },
  {
    "id": "atalla-1228-req",
    "code": "1228",
    "direction": "request",
    "pairedCode": "2228",
    "name": {
      "es": "Confirm Reset HSM to Factory State (Petición)",
      "en": "Confirm Reset HSM to Factory State (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 1228: Confirm Reset HSM to Factory State",
      "en": "Atalla AT1000 Command 1228: Confirm Reset HSM to Factory State"
    },
    "description": {
      "es": "Ejecuta la operación de Confirm Reset HSM to Factory State en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Confirm Reset HSM to Factory State operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Operaciones Criptográficas",
      "en": "Cryptographic Operations"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Confirm Reset HSM to Factory State",
          "en": "Fields and parameters for Confirm Reset HSM to Factory State"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "notes": [
      {
        "es": "[NOTE] NOTE: This command is only allowed on the serial port.",
        "en": "[NOTE] NOTE: This command is only allowed on the serial port."
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 1228 (Confirm Reset HSM to Factory State)"
  },
  {
    "id": "atalla-123-req",
    "code": "123",
    "direction": "request",
    "pairedCode": "223",
    "name": {
      "es": "Verify Public Key and Generate RSA-AKB (Petición)",
      "en": "Verify Public Key and Generate RSA-AKB (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 123: Verify Public Key and Generate RSA-AKB",
      "en": "Atalla AT1000 Command 123: Verify Public Key and Generate RSA-AKB"
    },
    "description": {
      "es": "Ejecuta la operación de Verify Public Key and Generate RSA-AKB en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Verify Public Key and Generate RSA-AKB operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Gestión de Claves",
      "en": "Key Management"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Verify Public Key and Generate RSA-AKB",
          "en": "Fields and parameters for Verify Public Key and Generate RSA-AKB"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 123 (Verify Public Key and Generate RSA-AKB)"
  },
  {
    "id": "atalla-1230-req",
    "code": "1230",
    "direction": "request",
    "pairedCode": "2230",
    "name": {
      "es": "Generate Pending TLS Server Key (Petición)",
      "en": "Generate Pending TLS Server Key (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 1230: Generate Pending TLS Server Key",
      "en": "Atalla AT1000 Command 1230: Generate Pending TLS Server Key"
    },
    "description": {
      "es": "Ejecuta la operación de Generate Pending TLS Server Key en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Generate Pending TLS Server Key operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Gestión de Claves",
      "en": "Key Management"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Generate Pending TLS Server Key",
          "en": "Fields and parameters for Generate Pending TLS Server Key"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 1230 (Generate Pending TLS Server Key)"
  },
  {
    "id": "atalla-124-req",
    "code": "124",
    "direction": "request",
    "pairedCode": "224",
    "name": {
      "es": "Generate Digital Signature (Petición)",
      "en": "Generate Digital Signature (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 124: Generate Digital Signature",
      "en": "Atalla AT1000 Command 124: Generate Digital Signature"
    },
    "description": {
      "es": "Ejecuta la operación de Generate Digital Signature en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Generate Digital Signature operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Operaciones Criptográficas",
      "en": "Cryptographic Operations"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Generate Digital Signature",
          "en": "Fields and parameters for Generate Digital Signature"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 124 (Generate Digital Signature)"
  },
  {
    "id": "atalla-125-req",
    "code": "125",
    "direction": "request",
    "pairedCode": "225",
    "name": {
      "es": "Verify Digital Signature (Petición)",
      "en": "Verify Digital Signature (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 125: Verify Digital Signature",
      "en": "Atalla AT1000 Command 125: Verify Digital Signature"
    },
    "description": {
      "es": "Ejecuta la operación de Verify Digital Signature en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Verify Digital Signature operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Operaciones Criptográficas",
      "en": "Cryptographic Operations"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Verify Digital Signature",
          "en": "Fields and parameters for Verify Digital Signature"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 125 (Verify Digital Signature)"
  },
  {
    "id": "atalla-126-req",
    "code": "126",
    "direction": "request",
    "pairedCode": "226",
    "name": {
      "es": "Generate Message Digest (Petición)",
      "en": "Generate Message Digest (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 126: Generate Message Digest",
      "en": "Atalla AT1000 Command 126: Generate Message Digest"
    },
    "description": {
      "es": "Ejecuta la operación de Generate Message Digest en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Generate Message Digest operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Operaciones Criptográficas",
      "en": "Cryptographic Operations"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Generate Message Digest",
          "en": "Fields and parameters for Generate Message Digest"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 126 (Generate Message Digest)"
  },
  {
    "id": "atalla-128-req",
    "code": "128",
    "direction": "request",
    "pairedCode": "228",
    "name": {
      "es": "Change AKB Header (Petición)",
      "en": "Change AKB Header (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 128: Change AKB Header",
      "en": "Atalla AT1000 Command 128: Change AKB Header"
    },
    "description": {
      "es": "Ejecuta la operación de Change AKB Header en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Change AKB Header operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Gestión de Claves",
      "en": "Key Management"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Change AKB Header",
          "en": "Fields and parameters for Change AKB Header"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 128 (Change AKB Header)"
  },
  {
    "id": "atalla-129-req",
    "code": "129",
    "direction": "request",
    "pairedCode": "229",
    "name": {
      "es": "Generate ATM Master Key encrypt with OAEP-SHA256 (Petición)",
      "en": "Generate ATM Master Key encrypt with OAEP-SHA256 (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 129: Generate ATM Master Key encrypt with OAEP-SHA256",
      "en": "Atalla AT1000 Command 129: Generate ATM Master Key encrypt with OAEP-SHA256"
    },
    "description": {
      "es": "Ejecuta la operación de Generate ATM Master Key encrypt with OAEP-SHA256 en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Generate ATM Master Key encrypt with OAEP-SHA256 operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Gestión de Claves",
      "en": "Key Management"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Generate ATM Master Key encrypt with OAEP-SHA256",
          "en": "Fields and parameters for Generate ATM Master Key encrypt with OAEP-SHA256"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 129 (Generate ATM Master Key encrypt with OAEP-SHA256)"
  },
  {
    "id": "atalla-12a-req",
    "code": "12A",
    "direction": "request",
    "pairedCode": "22A",
    "name": {
      "es": "Generate AKB of Public Key (Petición)",
      "en": "Generate AKB of Public Key (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 12A: Generate AKB of Public Key",
      "en": "Atalla AT1000 Command 12A: Generate AKB of Public Key"
    },
    "description": {
      "es": "Ejecuta la operación de Generate AKB of Public Key en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Generate AKB of Public Key operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Gestión de Claves",
      "en": "Key Management"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Generate AKB of Public Key",
          "en": "Fields and parameters for Generate AKB of Public Key"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 12A (Generate AKB of Public Key)"
  },
  {
    "id": "atalla-12b-req",
    "code": "12B",
    "direction": "request",
    "pairedCode": "22B",
    "name": {
      "es": "Translate Public or Private Key AKB from MFK to PMFK (Petición)",
      "en": "Translate Public or Private Key AKB from MFK to PMFK (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 12B: Translate Public or Private Key AKB from MFK to PMFK",
      "en": "Atalla AT1000 Command 12B: Translate Public or Private Key AKB from MFK to PMFK"
    },
    "description": {
      "es": "Ejecuta la operación de Translate Public or Private Key AKB from MFK to PMFK en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Translate Public or Private Key AKB from MFK to PMFK operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Gestión de Claves",
      "en": "Key Management"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Translate Public or Private Key AKB from MFK to PMFK",
          "en": "Fields and parameters for Translate Public or Private Key AKB from MFK to PMFK"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 12B (Translate Public or Private Key AKB from MFK to PMFK)"
  },
  {
    "id": "atalla-12c-req",
    "code": "12C",
    "direction": "request",
    "pairedCode": "22C",
    "name": {
      "es": "Verify or Delete RSA Key Table Entry (Petición)",
      "en": "Verify or Delete RSA Key Table Entry (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 12C: Verify or Delete RSA Key Table Entry",
      "en": "Atalla AT1000 Command 12C: Verify or Delete RSA Key Table Entry"
    },
    "description": {
      "es": "Ejecuta la operación de Verify or Delete RSA Key Table Entry en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Verify or Delete RSA Key Table Entry operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Gestión de Claves",
      "en": "Key Management"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Verify or Delete RSA Key Table Entry",
          "en": "Fields and parameters for Verify or Delete RSA Key Table Entry"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 12C (Verify or Delete RSA Key Table Entry)"
  },
  {
    "id": "atalla-12f-req",
    "code": "12F",
    "direction": "request",
    "pairedCode": "22F",
    "name": {
      "es": "Generate ATM Master Key and encrypt with public key (Petición)",
      "en": "Generate ATM Master Key and encrypt with public key (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 12F: Generate ATM Master Key and encrypt with public key",
      "en": "Atalla AT1000 Command 12F: Generate ATM Master Key and encrypt with public key"
    },
    "description": {
      "es": "Ejecuta la operación de Generate ATM Master Key and encrypt with public key en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Generate ATM Master Key and encrypt with public key operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Gestión de Claves",
      "en": "Key Management"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Generate ATM Master Key and encrypt with public key",
          "en": "Fields and parameters for Generate ATM Master Key and encrypt with public key"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 12F (Generate ATM Master Key and encrypt with public key)"
  },
  {
    "id": "atalla-13-req",
    "code": "13",
    "direction": "request",
    "pairedCode": "23",
    "name": {
      "es": "Import a Working Key in AKB Format (Petición)",
      "en": "Import a Working Key in AKB Format (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 13: Import a Working Key in AKB Format",
      "en": "Atalla AT1000 Command 13: Import a Working Key in AKB Format"
    },
    "description": {
      "es": "Ejecuta la operación de Import a Working Key in AKB Format en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Import a Working Key in AKB Format operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Gestión de Claves",
      "en": "Key Management"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Import a Working Key in AKB Format",
          "en": "Fields and parameters for Import a Working Key in AKB Format"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 13 (Import a Working Key in AKB Format)"
  },
  {
    "id": "atalla-130-req",
    "code": "130",
    "direction": "request",
    "pairedCode": "230",
    "name": {
      "es": "RSA Data Encrypt (Petición)",
      "en": "RSA Data Encrypt (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 130: RSA Data Encrypt",
      "en": "Atalla AT1000 Command 130: RSA Data Encrypt"
    },
    "description": {
      "es": "Ejecuta la operación de RSA Data Encrypt en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes RSA Data Encrypt operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Operaciones Criptográficas",
      "en": "Cryptographic Operations"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para RSA Data Encrypt",
          "en": "Fields and parameters for RSA Data Encrypt"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 130 (RSA Data Encrypt)"
  },
  {
    "id": "atalla-131-req",
    "code": "131",
    "direction": "request",
    "pairedCode": "231",
    "name": {
      "es": "EMV Sign Data (Petición)",
      "en": "EMV Sign Data (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 131: EMV Sign Data",
      "en": "Atalla AT1000 Command 131: EMV Sign Data"
    },
    "description": {
      "es": "Ejecuta la operación de EMV Sign Data en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes EMV Sign Data operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Tarjetas y EMV",
      "en": "Cards & EMV"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para EMV Sign Data",
          "en": "Fields and parameters for EMV Sign Data"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 131 (EMV Sign Data)"
  },
  {
    "id": "atalla-132-req",
    "code": "132",
    "direction": "request",
    "pairedCode": "232",
    "name": {
      "es": "EMV Recover Data (Petición)",
      "en": "EMV Recover Data (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 132: EMV Recover Data",
      "en": "Atalla AT1000 Command 132: EMV Recover Data"
    },
    "description": {
      "es": "Ejecuta la operación de EMV Recover Data en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes EMV Recover Data operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Tarjetas y EMV",
      "en": "Cards & EMV"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para EMV Recover Data",
          "en": "Fields and parameters for EMV Recover Data"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 132 (EMV Recover Data)"
  },
  {
    "id": "atalla-135-req",
    "code": "135",
    "direction": "request",
    "pairedCode": "235",
    "name": {
      "es": "Export RSA Private Key in untrusted format (Petición)",
      "en": "Export RSA Private Key in untrusted format (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 135: Export RSA Private Key in untrusted format",
      "en": "Atalla AT1000 Command 135: Export RSA Private Key in untrusted format"
    },
    "description": {
      "es": "Ejecuta la operación de Export RSA Private Key in untrusted format en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Export RSA Private Key in untrusted format operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Gestión de Claves",
      "en": "Key Management"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Export RSA Private Key in untrusted format",
          "en": "Fields and parameters for Export RSA Private Key in untrusted format"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 135 (Export RSA Private Key in untrusted format)"
  },
  {
    "id": "atalla-1350-req",
    "code": "1350",
    "direction": "request",
    "pairedCode": "2350",
    "name": {
      "es": "Select HSM Domain (Petición)",
      "en": "Select HSM Domain (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 1350: Select HSM Domain",
      "en": "Atalla AT1000 Command 1350: Select HSM Domain"
    },
    "description": {
      "es": "Ejecuta la operación de Select HSM Domain en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Select HSM Domain operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Operaciones Criptográficas",
      "en": "Cryptographic Operations"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Select HSM Domain",
          "en": "Fields and parameters for Select HSM Domain"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "notes": [
      {
        "es": "[NOTE] NOTE: This command is only allowed on the serial port. It should only be sent to an HSM that is configured for",
        "en": "[NOTE] NOTE: This command is only allowed on the serial port. It should only be sent to an HSM that is configured for"
      },
      {
        "es": "[NOTE] multiple Domains.",
        "en": "[NOTE] multiple Domains."
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 1350 (Select HSM Domain)"
  },
  {
    "id": "atalla-1351-req",
    "code": "1351",
    "direction": "request",
    "pairedCode": "2351",
    "name": {
      "es": "HSM Domain System Information (Petición)",
      "en": "HSM Domain System Information (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 1351: HSM Domain System Information",
      "en": "Atalla AT1000 Command 1351: HSM Domain System Information"
    },
    "description": {
      "es": "Ejecuta la operación de HSM Domain System Information en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes HSM Domain System Information operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Diagnóstico y Sistema",
      "en": "Diagnostics & System"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para HSM Domain System Information",
          "en": "Fields and parameters for HSM Domain System Information"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "notes": [
      {
        "es": "[NOTE] NOTE: This command is only allowed on the serial port. It should only be sent to an HSM that is configured for",
        "en": "[NOTE] NOTE: This command is only allowed on the serial port. It should only be sent to an HSM that is configured for"
      },
      {
        "es": "[NOTE] multiple Domains.",
        "en": "[NOTE] multiple Domains."
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 1351 (HSM Domain System Information)"
  },
  {
    "id": "atalla-136-req",
    "code": "136",
    "direction": "request",
    "pairedCode": "236",
    "name": {
      "es": "Generate a TR-34 Key Block (Petición)",
      "en": "Generate a TR-34 Key Block (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 136: Generate a TR-34 Key Block",
      "en": "Atalla AT1000 Command 136: Generate a TR-34 Key Block"
    },
    "description": {
      "es": "Ejecuta la operación de Generate a TR-34 Key Block en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Generate a TR-34 Key Block operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Gestión de Claves",
      "en": "Key Management"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Generate a TR-34 Key Block",
          "en": "Fields and parameters for Generate a TR-34 Key Block"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 136 (Generate a TR-34 Key Block)"
  },
  {
    "id": "atalla-137-req",
    "code": "137",
    "direction": "request",
    "pairedCode": "237",
    "name": {
      "es": "Combine SCA-generated components (Petición)",
      "en": "Combine SCA-generated components (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 137: Combine SCA-generated components",
      "en": "Atalla AT1000 Command 137: Combine SCA-generated components"
    },
    "description": {
      "es": "Ejecuta la operación de Combine SCA-generated components en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Combine SCA-generated components operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Operaciones Criptográficas",
      "en": "Cryptographic Operations"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Combine SCA-generated components",
          "en": "Fields and parameters for Combine SCA-generated components"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "notes": [
      {
        "es": "[NOTE] NOTE: The algorithm byte of a component header will not indicate the algorithm of the resulting key. The",
        "en": "[NOTE] NOTE: The algorithm byte of a component header will not indicate the algorithm of the resulting key. The"
      },
      {
        "es": "[NOTE] algorithm byte is $ , indicating it is a component value created by the SCA and cannot be used in any",
        "en": "[NOTE] algorithm byte is $ , indicating it is a component value created by the SCA and cannot be used in any"
      },
      {
        "es": "[NOTE] cryptographic algorithm as a key. (A component of a 3DES key is not itself a 3DES key.) The algorithm of the",
        "en": "[NOTE] cryptographic algorithm as a key. (A component of a 3DES key is not itself a 3DES key.) The algorithm of the"
      },
      {
        "es": "[NOTE] key is stored in the target header, so the component cannot be used as any other algorithm. The $ algorithm",
        "en": "[NOTE] key is stored in the target header, so the component cannot be used as any other algorithm. The $ algorithm"
      },
      {
        "es": "[NOTE] also signals the component AKB format that contains all the extra fields listed.",
        "en": "[NOTE] also signals the component AKB format that contains all the extra fields listed."
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 137 (Combine SCA-generated components)"
  },
  {
    "id": "atalla-138-req",
    "code": "138",
    "direction": "request",
    "pairedCode": "238",
    "name": {
      "es": "RSA Data Decrypt (Petición)",
      "en": "RSA Data Decrypt (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 138: RSA Data Decrypt",
      "en": "Atalla AT1000 Command 138: RSA Data Decrypt"
    },
    "description": {
      "es": "Ejecuta la operación de RSA Data Decrypt en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes RSA Data Decrypt operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Operaciones Criptográficas",
      "en": "Cryptographic Operations"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para RSA Data Decrypt",
          "en": "Fields and parameters for RSA Data Decrypt"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 138 (RSA Data Decrypt)"
  },
  {
    "id": "atalla-139-req",
    "code": "139",
    "direction": "request",
    "pairedCode": "239",
    "name": {
      "es": "Sign TR-34 Message (Petición)",
      "en": "Sign TR-34 Message (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 139: Sign TR-34 Message",
      "en": "Atalla AT1000 Command 139: Sign TR-34 Message"
    },
    "description": {
      "es": "Ejecuta la operación de Sign TR-34 Message en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Sign TR-34 Message operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Operaciones Criptográficas",
      "en": "Cryptographic Operations"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Sign TR-34 Message",
          "en": "Fields and parameters for Sign TR-34 Message"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 139 (Sign TR-34 Message)"
  },
  {
    "id": "atalla-13f-req",
    "code": "13F",
    "direction": "request",
    "pairedCode": "23F",
    "name": {
      "es": "Generate ZKA Working Key (Petición)",
      "en": "Generate ZKA Working Key (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 13F: Generate ZKA Working Key",
      "en": "Atalla AT1000 Command 13F: Generate ZKA Working Key"
    },
    "description": {
      "es": "Ejecuta la operación de Generate ZKA Working Key en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Generate ZKA Working Key operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Gestión de Claves",
      "en": "Key Management"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Generate ZKA Working Key",
          "en": "Fields and parameters for Generate ZKA Working Key"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 13F (Generate ZKA Working Key)"
  },
  {
    "id": "atalla-14-req",
    "code": "14",
    "direction": "request",
    "pairedCode": "24",
    "name": {
      "es": "Load ATM Master Key, Diebold (Petición)",
      "en": "Load ATM Master Key, Diebold (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 14: Load ATM Master Key, Diebold",
      "en": "Atalla AT1000 Command 14: Load ATM Master Key, Diebold"
    },
    "description": {
      "es": "Ejecuta la operación de Load ATM Master Key, Diebold en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Load ATM Master Key, Diebold operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Gestión de Claves",
      "en": "Key Management"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Load ATM Master Key, Diebold",
          "en": "Fields and parameters for Load ATM Master Key, Diebold"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 14 (Load ATM Master Key, Diebold)"
  },
  {
    "id": "atalla-140-req",
    "code": "140",
    "direction": "request",
    "pairedCode": "240",
    "name": {
      "es": "Import Key Wrapping Keys under RSA Encryption (Petición)",
      "en": "Import Key Wrapping Keys under RSA Encryption (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 140: Import Key Wrapping Keys under RSA Encryption",
      "en": "Atalla AT1000 Command 140: Import Key Wrapping Keys under RSA Encryption"
    },
    "description": {
      "es": "Ejecuta la operación de Import Key Wrapping Keys under RSA Encryption en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Import Key Wrapping Keys under RSA Encryption operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Procesamiento de PIN",
      "en": "PIN Processing"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Import Key Wrapping Keys under RSA Encryption",
          "en": "Fields and parameters for Import Key Wrapping Keys under RSA Encryption"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "notes": [
      {
        "es": "[CAUTION] CAUTION: Once the count value reaches zero, the HSM will return an error <00#0300xx#> instead of",
        "en": "[CAUTION] CAUTION: Once the count value reaches zero, the HSM will return an error <00#0300xx#> instead of"
      },
      {
        "es": "[CAUTION] processing the command. The command <9A#COUNT#> will return the current count value for all commands",
        "en": "[CAUTION] processing the command. The command <9A#COUNT#> will return the current count value for all commands"
      },
      {
        "es": "[CAUTION] in the command count table.",
        "en": "[CAUTION] in the command count table."
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 140 (Import Key Wrapping Keys under RSA Encryption)"
  },
  {
    "id": "atalla-141-req",
    "code": "141",
    "direction": "request",
    "pairedCode": "241",
    "name": {
      "es": "Export Working Key under RSA Encryption (Petición)",
      "en": "Export Working Key under RSA Encryption (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 141: Export Working Key under RSA Encryption",
      "en": "Atalla AT1000 Command 141: Export Working Key under RSA Encryption"
    },
    "description": {
      "es": "Ejecuta la operación de Export Working Key under RSA Encryption en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Export Working Key under RSA Encryption operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Gestión de Claves",
      "en": "Key Management"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Export Working Key under RSA Encryption",
          "en": "Fields and parameters for Export Working Key under RSA Encryption"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 141 (Export Working Key under RSA Encryption)"
  },
  {
    "id": "atalla-142-req",
    "code": "142",
    "direction": "request",
    "pairedCode": "242",
    "name": {
      "es": "Import Key under RSA Encryption (Petición)",
      "en": "Import Key under RSA Encryption (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 142: Import Key under RSA Encryption",
      "en": "Atalla AT1000 Command 142: Import Key under RSA Encryption"
    },
    "description": {
      "es": "Ejecuta la operación de Import Key under RSA Encryption en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Import Key under RSA Encryption operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Gestión de Claves",
      "en": "Key Management"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Import Key under RSA Encryption",
          "en": "Fields and parameters for Import Key under RSA Encryption"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 142 (Import Key under RSA Encryption)"
  },
  {
    "id": "atalla-143-req",
    "code": "143",
    "direction": "request",
    "pairedCode": "243",
    "name": {
      "es": "Import non-PTS Public Key (Petición)",
      "en": "Import non-PTS Public Key (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 143: Import non-PTS Public Key",
      "en": "Atalla AT1000 Command 143: Import non-PTS Public Key"
    },
    "description": {
      "es": "Ejecuta la operación de Import non-PTS Public Key en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Import non-PTS Public Key operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Gestión de Claves",
      "en": "Key Management"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Import non-PTS Public Key",
          "en": "Fields and parameters for Import non-PTS Public Key"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "notes": [
      {
        "es": "[CAUTION] CAUTION: There is no dual control over this command, so any user of the HSM can introduce a public key.",
        "en": "[CAUTION] CAUTION: There is no dual control over this command, so any user of the HSM can introduce a public key."
      },
      {
        "es": "[CAUTION] Keys loaded this way can never be used to encrypt PIN keys or key wrapping keys that can protect PIN keys,",
        "en": "[CAUTION] Keys loaded this way can never be used to encrypt PIN keys or key wrapping keys that can protect PIN keys,"
      },
      {
        "es": "[CAUTION] because PIN keys and the keys that protect them must always be under dual control.",
        "en": "[CAUTION] because PIN keys and the keys that protect them must always be under dual control."
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 143 (Import non-PTS Public Key)"
  },
  {
    "id": "atalla-144-req",
    "code": "144",
    "direction": "request",
    "pairedCode": "244",
    "name": {
      "es": "Import Working Key Encrypted under AES No Keyblock (Petición)",
      "en": "Import Working Key Encrypted under AES No Keyblock (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 144: Import Working Key Encrypted under AES No Keyblock",
      "en": "Atalla AT1000 Command 144: Import Working Key Encrypted under AES No Keyblock"
    },
    "description": {
      "es": "Ejecuta la operación de Import Working Key Encrypted under AES No Keyblock en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Import Working Key Encrypted under AES No Keyblock operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Gestión de Claves",
      "en": "Key Management"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Import Working Key Encrypted under AES No Keyblock",
          "en": "Fields and parameters for Import Working Key Encrypted under AES No Keyblock"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "notes": [
      {
        "es": "[NOTE] NOTE: This command is deprecated. Where possible, use TR-31 key blocks and command 310.",
        "en": "[NOTE] NOTE: This command is deprecated. Where possible, use TR-31 key blocks and command 310."
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 144 (Import Working Key Encrypted under AES No Keyblock)"
  },
  {
    "id": "atalla-145-req",
    "code": "145",
    "direction": "request",
    "pairedCode": "245",
    "name": {
      "es": "Export Working Key Encrypted under AES, No Keyblock (Petición)",
      "en": "Export Working Key Encrypted under AES, No Keyblock (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 145: Export Working Key Encrypted under AES, No Keyblock",
      "en": "Atalla AT1000 Command 145: Export Working Key Encrypted under AES, No Keyblock"
    },
    "description": {
      "es": "Ejecuta la operación de Export Working Key Encrypted under AES, No Keyblock en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Export Working Key Encrypted under AES, No Keyblock operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Gestión de Claves",
      "en": "Key Management"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Export Working Key Encrypted under AES, No Keyblock",
          "en": "Fields and parameters for Export Working Key Encrypted under AES, No Keyblock"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "notes": [
      {
        "es": "[NOTE] NOTE: This command is deprecated. Where possible, use TR-31 key blocks and command 311 - Export",
        "en": "[NOTE] NOTE: This command is deprecated. Where possible, use TR-31 key blocks and command 311 - Export"
      },
      {
        "es": "[NOTE] Working Key in TR-31 Format, version D (AES).",
        "en": "[NOTE] Working Key in TR-31 Format, version D (AES)."
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 145 (Export Working Key Encrypted under AES, No Keyblock)"
  },
  {
    "id": "atalla-146-req",
    "code": "146",
    "direction": "request",
    "pairedCode": "246",
    "name": {
      "es": "Translate Encrypted Data (Petición)",
      "en": "Translate Encrypted Data (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 146: Translate Encrypted Data",
      "en": "Atalla AT1000 Command 146: Translate Encrypted Data"
    },
    "description": {
      "es": "Ejecuta la operación de Translate Encrypted Data en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Translate Encrypted Data operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Operaciones Criptográficas",
      "en": "Cryptographic Operations"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Translate Encrypted Data",
          "en": "Fields and parameters for Translate Encrypted Data"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 146 (Translate Encrypted Data)"
  },
  {
    "id": "atalla-147-req",
    "code": "147",
    "direction": "request",
    "pairedCode": "247",
    "name": {
      "es": "Elliptic Curve Diffie-Hellman (Petición)",
      "en": "Elliptic Curve Diffie-Hellman (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 147: Elliptic Curve Diffie-Hellman",
      "en": "Atalla AT1000 Command 147: Elliptic Curve Diffie-Hellman"
    },
    "description": {
      "es": "Ejecuta la operación de Elliptic Curve Diffie-Hellman en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Elliptic Curve Diffie-Hellman operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Operaciones Criptográficas",
      "en": "Cryptographic Operations"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Elliptic Curve Diffie-Hellman",
          "en": "Fields and parameters for Elliptic Curve Diffie-Hellman"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "notes": [
      {
        "es": "[CAUTION] CAUTION: Once the count value reaches zero, the HSM will return an error <00#0300xx#> instead of",
        "en": "[CAUTION] CAUTION: Once the count value reaches zero, the HSM will return an error <00#0300xx#> instead of"
      },
      {
        "es": "[CAUTION] processing the command. The command <9A#COUNT#> will return the current count value for all commands",
        "en": "[CAUTION] processing the command. The command <9A#COUNT#> will return the current count value for all commands"
      },
      {
        "es": "[CAUTION] in the command count table.",
        "en": "[CAUTION] in the command count table."
      },
      {
        "es": "[CAUTION] CAUTION: This command should be treated like a command that loads key components in the clear. The",
        "en": "[CAUTION] CAUTION: This command should be treated like a command that loads key components in the clear. The"
      },
      {
        "es": "[CAUTION] command has no authentication of the entity exchanging keys or the type and purpose of the derived key. If any",
        "en": "[CAUTION] command has no authentication of the entity exchanging keys or the type and purpose of the derived key. If any"
      },
      {
        "es": "[CAUTION] person or malware can send this command to the HSM while the command is enabled, then the attacker can",
        "en": "[CAUTION] person or malware can send this command to the HSM while the command is enabled, then the attacker can"
      },
      {
        "es": "[CAUTION] introduce known KEKs/KBPKs into the HSM. That would allow an attacker to compromise all exportable keys in",
        "en": "[CAUTION] introduce known KEKs/KBPKs into the HSM. That would allow an attacker to compromise all exportable keys in"
      },
      {
        "es": "[CAUTION] the HSM. It is the user's responsibility to authenticate any public key used in this command, verify that key",
        "en": "[CAUTION] the HSM. It is the user's responsibility to authenticate any public key used in this command, verify that key"
      },
      {
        "es": "[CAUTION] derivation parameters and resulting keys are appropriate, and to prevent calling this command twice with the",
        "en": "[CAUTION] derivation parameters and resulting keys are appropriate, and to prevent calling this command twice with the"
      },
      {
        "es": "[CAUTION] same ECDH keys.",
        "en": "[CAUTION] same ECDH keys."
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 147 (Elliptic Curve Diffie-Hellman)"
  },
  {
    "id": "atalla-14a-req",
    "code": "14A",
    "direction": "request",
    "pairedCode": "24A",
    "name": {
      "es": "Generate an AS2805 KSKs Validation Request (Petición)",
      "en": "Generate an AS2805 KSKs Validation Request (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 14A: Generate an AS2805 KSKs Validation Request",
      "en": "Atalla AT1000 Command 14A: Generate an AS2805 KSKs Validation Request"
    },
    "description": {
      "es": "Ejecuta la operación de Generate an AS2805 KSKs Validation Request en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Generate an AS2805 KSKs Validation Request operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Operaciones Criptográficas",
      "en": "Cryptographic Operations"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Generate an AS2805 KSKs Validation Request",
          "en": "Fields and parameters for Generate an AS2805 KSKs Validation Request"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 14A (Generate an AS2805 KSKs Validation Request)"
  },
  {
    "id": "atalla-14b-req",
    "code": "14B",
    "direction": "request",
    "pairedCode": "24B",
    "name": {
      "es": "Generate an AS2805 Send KEKr Validation Response (Petición)",
      "en": "Generate an AS2805 Send KEKr Validation Response (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 14B: Generate an AS2805 Send KEKr Validation Response",
      "en": "Atalla AT1000 Command 14B: Generate an AS2805 Send KEKr Validation Response"
    },
    "description": {
      "es": "Ejecuta la operación de Generate an AS2805 Send KEKr Validation Response en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Generate an AS2805 Send KEKr Validation Response operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Gestión de Claves",
      "en": "Key Management"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Generate an AS2805 Send KEKr Validation Response",
          "en": "Fields and parameters for Generate an AS2805 Send KEKr Validation Response"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 14B (Generate an AS2805 Send KEKr Validation Response)"
  },
  {
    "id": "atalla-14c-req",
    "code": "14C",
    "direction": "request",
    "pairedCode": "24C",
    "name": {
      "es": "Generate a set of Australia Standards 2805 session keys (Petición)",
      "en": "Generate a set of Australia Standards 2805 session keys (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 14C: Generate a set of Australia Standards 2805 session keys",
      "en": "Atalla AT1000 Command 14C: Generate a set of Australia Standards 2805 session keys"
    },
    "description": {
      "es": "Ejecuta la operación de Generate a set of Australia Standards 2805 session keys en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Generate a set of Australia Standards 2805 session keys operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Gestión de Claves",
      "en": "Key Management"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Generate a set of Australia Standards 2805 session keys",
          "en": "Fields and parameters for Generate a set of Australia Standards 2805 session keys"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 14C (Generate a set of Australia Standards 2805 session keys)"
  },
  {
    "id": "atalla-14d-req",
    "code": "14D",
    "direction": "request",
    "pairedCode": "24D",
    "name": {
      "es": "Receive a set of Australia Standards 2805 session keys (Petición)",
      "en": "Receive a set of Australia Standards 2805 session keys (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 14D: Receive a set of Australia Standards 2805 session keys",
      "en": "Atalla AT1000 Command 14D: Receive a set of Australia Standards 2805 session keys"
    },
    "description": {
      "es": "Ejecuta la operación de Receive a set of Australia Standards 2805 session keys en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Receive a set of Australia Standards 2805 session keys operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Gestión de Claves",
      "en": "Key Management"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Receive a set of Australia Standards 2805 session keys",
          "en": "Fields and parameters for Receive a set of Australia Standards 2805 session keys"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "notes": [
      {
        "es": "[NOTE] NOTE: The inclusion of any of these keys is optional, as not all institutions need all three key types.",
        "en": "[NOTE] NOTE: The inclusion of any of these keys is optional, as not all institutions need all three key types."
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 14D (Receive a set of Australia Standards 2805 session keys)"
  },
  {
    "id": "atalla-15-req",
    "code": "15",
    "direction": "request",
    "pairedCode": "25",
    "name": {
      "es": "Change ATM Communications Key, Diebold (Petición)",
      "en": "Change ATM Communications Key, Diebold (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 15: Change ATM Communications Key, Diebold",
      "en": "Atalla AT1000 Command 15: Change ATM Communications Key, Diebold"
    },
    "description": {
      "es": "Ejecuta la operación de Change ATM Communications Key, Diebold en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Change ATM Communications Key, Diebold operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Gestión de Claves",
      "en": "Key Management"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Change ATM Communications Key, Diebold",
          "en": "Fields and parameters for Change ATM Communications Key, Diebold"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 15 (Change ATM Communications Key, Diebold)"
  },
  {
    "id": "atalla-150-req",
    "code": "150",
    "direction": "request",
    "pairedCode": "250",
    "name": {
      "es": "Enroll new user password (Petición)",
      "en": "Enroll new user password (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 150: Enroll new user password",
      "en": "Atalla AT1000 Command 150: Enroll new user password"
    },
    "description": {
      "es": "Ejecuta la operación de Enroll new user password en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Enroll new user password operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Operaciones Criptográficas",
      "en": "Cryptographic Operations"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Enroll new user password",
          "en": "Fields and parameters for Enroll new user password"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 150 (Enroll new user password)"
  },
  {
    "id": "atalla-151-req",
    "code": "151",
    "direction": "request",
    "pairedCode": "251",
    "name": {
      "es": "Verify Password (Petición)",
      "en": "Verify Password (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 151: Verify Password",
      "en": "Atalla AT1000 Command 151: Verify Password"
    },
    "description": {
      "es": "Ejecuta la operación de Verify Password en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Verify Password operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Operaciones Criptográficas",
      "en": "Cryptographic Operations"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Verify Password",
          "en": "Fields and parameters for Verify Password"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 151 (Verify Password)"
  },
  {
    "id": "atalla-152-req",
    "code": "152",
    "direction": "request",
    "pairedCode": "252",
    "name": {
      "es": "Change password (Petición)",
      "en": "Change password (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 152: Change password",
      "en": "Atalla AT1000 Command 152: Change password"
    },
    "description": {
      "es": "Ejecuta la operación de Change password en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Change password operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Operaciones Criptográficas",
      "en": "Cryptographic Operations"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Change password",
          "en": "Fields and parameters for Change password"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 152 (Change password)"
  },
  {
    "id": "atalla-153-req",
    "code": "153",
    "direction": "request",
    "pairedCode": "253",
    "name": {
      "es": "Generate temporary password (Petición)",
      "en": "Generate temporary password (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 153: Generate temporary password",
      "en": "Atalla AT1000 Command 153: Generate temporary password"
    },
    "description": {
      "es": "Ejecuta la operación de Generate temporary password en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Generate temporary password operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Operaciones Criptográficas",
      "en": "Cryptographic Operations"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Generate temporary password",
          "en": "Fields and parameters for Generate temporary password"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 153 (Generate temporary password)"
  },
  {
    "id": "atalla-154-req",
    "code": "154",
    "direction": "request",
    "pairedCode": "254",
    "name": {
      "es": "Generate ISO/IEC 14888-3 Digital Signature using EC-SDSA (Petición)",
      "en": "Generate ISO/IEC 14888-3 Digital Signature using EC-SDSA (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 154: Generate ISO/IEC 14888-3 Digital Signature using EC-SDSA",
      "en": "Atalla AT1000 Command 154: Generate ISO/IEC 14888-3 Digital Signature using EC-SDSA"
    },
    "description": {
      "es": "Ejecuta la operación de Generate ISO/IEC 14888-3 Digital Signature using EC-SDSA en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Generate ISO/IEC 14888-3 Digital Signature using EC-SDSA operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Operaciones Criptográficas",
      "en": "Cryptographic Operations"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Generate ISO/IEC 14888-3 Digital Signature using EC-SDSA",
          "en": "Fields and parameters for Generate ISO/IEC 14888-3 Digital Signature using EC-SDSA"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 154 (Generate ISO/IEC 14888-3 Digital Signature using EC-SDSA)"
  },
  {
    "id": "atalla-155-req",
    "code": "155",
    "direction": "request",
    "pairedCode": "255",
    "name": {
      "es": "Verify ISO/IEC 14888-3 Digital Signature using EC-SDSA (Petición)",
      "en": "Verify ISO/IEC 14888-3 Digital Signature using EC-SDSA (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 155: Verify ISO/IEC 14888-3 Digital Signature using EC-SDSA",
      "en": "Atalla AT1000 Command 155: Verify ISO/IEC 14888-3 Digital Signature using EC-SDSA"
    },
    "description": {
      "es": "Ejecuta la operación de Verify ISO/IEC 14888-3 Digital Signature using EC-SDSA en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Verify ISO/IEC 14888-3 Digital Signature using EC-SDSA operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Operaciones Criptográficas",
      "en": "Cryptographic Operations"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Verify ISO/IEC 14888-3 Digital Signature using EC-SDSA",
          "en": "Fields and parameters for Verify ISO/IEC 14888-3 Digital Signature using EC-SDSA"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 155 (Verify ISO/IEC 14888-3 Digital Signature using EC-SDSA)"
  },
  {
    "id": "atalla-156-req",
    "code": "156",
    "direction": "request",
    "pairedCode": "256",
    "name": {
      "es": "Generate check digits for an RSA key (Petición)",
      "en": "Generate check digits for an RSA key (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 156: Generate check digits for an RSA key",
      "en": "Atalla AT1000 Command 156: Generate check digits for an RSA key"
    },
    "description": {
      "es": "Ejecuta la operación de Generate check digits for an RSA key en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Generate check digits for an RSA key operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Gestión de Claves",
      "en": "Key Management"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Generate check digits for an RSA key",
          "en": "Fields and parameters for Generate check digits for an RSA key"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 156 (Generate check digits for an RSA key)"
  },
  {
    "id": "atalla-157-req",
    "code": "157",
    "direction": "request",
    "pairedCode": "257",
    "name": {
      "es": "Generate and export a KEKs using APCA 2000 RSA (Petición)",
      "en": "Generate and export a KEKs using APCA 2000 RSA (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 157: Generate and export a KEKs using APCA 2000 RSA",
      "en": "Atalla AT1000 Command 157: Generate and export a KEKs using APCA 2000 RSA"
    },
    "description": {
      "es": "Ejecuta la operación de Generate and export a KEKs using APCA 2000 RSA en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Generate and export a KEKs using APCA 2000 RSA operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Gestión de Claves",
      "en": "Key Management"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Generate and export a KEKs using APCA 2000 RSA",
          "en": "Fields and parameters for Generate and export a KEKs using APCA 2000 RSA"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 157 (Generate and export a KEKs using APCA 2000 RSA)"
  },
  {
    "id": "atalla-158-req",
    "code": "158",
    "direction": "request",
    "pairedCode": "258",
    "name": {
      "es": "Receive a KEKr using APCA 2000 RSA (Petición)",
      "en": "Receive a KEKr using APCA 2000 RSA (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 158: Receive a KEKr using APCA 2000 RSA",
      "en": "Atalla AT1000 Command 158: Receive a KEKr using APCA 2000 RSA"
    },
    "description": {
      "es": "Ejecuta la operación de Receive a KEKr using APCA 2000 RSA en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Receive a KEKr using APCA 2000 RSA operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Gestión de Claves",
      "en": "Key Management"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Receive a KEKr using APCA 2000 RSA",
          "en": "Fields and parameters for Receive a KEKr using APCA 2000 RSA"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 158 (Receive a KEKr using APCA 2000 RSA)"
  },
  {
    "id": "atalla-159-req",
    "code": "159",
    "direction": "request",
    "pairedCode": "259",
    "name": {
      "es": "Generate random PIN and/or IBM 3624 offset (Petición)",
      "en": "Generate random PIN and/or IBM 3624 offset (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 159: Generate random PIN and/or IBM 3624 offset",
      "en": "Atalla AT1000 Command 159: Generate random PIN and/or IBM 3624 offset"
    },
    "description": {
      "es": "Ejecuta la operación de Generate random PIN and/or IBM 3624 offset en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Generate random PIN and/or IBM 3624 offset operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Procesamiento de PIN",
      "en": "PIN Processing"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Generate random PIN and/or IBM 3624 offset",
          "en": "Fields and parameters for Generate random PIN and/or IBM 3624 offset"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 159 (Generate random PIN and/or IBM 3624 offset)"
  },
  {
    "id": "atalla-15a-req",
    "code": "15A",
    "direction": "request",
    "pairedCode": "25A",
    "name": {
      "es": "Elliptic Curve Diffie–Hellman for 3-D Secure (Petición)",
      "en": "Elliptic Curve Diffie–Hellman for 3-D Secure (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 15A: Elliptic Curve Diffie–Hellman for 3-D Secure",
      "en": "Atalla AT1000 Command 15A: Elliptic Curve Diffie–Hellman for 3-D Secure"
    },
    "description": {
      "es": "Ejecuta la operación de Elliptic Curve Diffie–Hellman for 3-D Secure en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Elliptic Curve Diffie–Hellman for 3-D Secure operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Operaciones Criptográficas",
      "en": "Cryptographic Operations"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Elliptic Curve Diffie–Hellman for 3-D Secure",
          "en": "Fields and parameters for Elliptic Curve Diffie–Hellman for 3-D Secure"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 15A (Elliptic Curve Diffie–Hellman for 3-D Secure)"
  },
  {
    "id": "atalla-15b-req",
    "code": "15B",
    "direction": "request",
    "pairedCode": "25B",
    "name": {
      "es": "Authenticated encryption or decryption (Petición)",
      "en": "Authenticated encryption or decryption (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 15B: Authenticated encryption or decryption",
      "en": "Atalla AT1000 Command 15B: Authenticated encryption or decryption"
    },
    "description": {
      "es": "Ejecuta la operación de Authenticated encryption or decryption en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Authenticated encryption or decryption operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Autenticación y MAC",
      "en": "Authentication & MAC"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Authenticated encryption or decryption",
          "en": "Fields and parameters for Authenticated encryption or decryption"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 15B (Authenticated encryption or decryption)"
  },
  {
    "id": "atalla-15c-req",
    "code": "15C",
    "direction": "request",
    "pairedCode": "25C",
    "name": {
      "es": "Import RSA Private Key in untrusted format (Petición)",
      "en": "Import RSA Private Key in untrusted format (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 15C: Import RSA Private Key in untrusted format",
      "en": "Atalla AT1000 Command 15C: Import RSA Private Key in untrusted format"
    },
    "description": {
      "es": "Ejecuta la operación de Import RSA Private Key in untrusted format en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Import RSA Private Key in untrusted format operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Gestión de Claves",
      "en": "Key Management"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Import RSA Private Key in untrusted format",
          "en": "Fields and parameters for Import RSA Private Key in untrusted format"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "notes": [
      {
        "es": "[CAUTION] CAUTION: Once the count value reaches zero, the HSM will return an error <00#0300xx#> instead of",
        "en": "[CAUTION] CAUTION: Once the count value reaches zero, the HSM will return an error <00#0300xx#> instead of"
      },
      {
        "es": "[CAUTION] processing the command. The command <9A#COUNT#> will return the current count value for all commands",
        "en": "[CAUTION] processing the command. The command <9A#COUNT#> will return the current count value for all commands"
      },
      {
        "es": "[CAUTION] in the command count table.",
        "en": "[CAUTION] in the command count table."
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 15C (Import RSA Private Key in untrusted format)"
  },
  {
    "id": "atalla-15d-req",
    "code": "15D",
    "direction": "request",
    "pairedCode": "25D",
    "name": {
      "es": "Import RSA Private Key from Websafe (Petición)",
      "en": "Import RSA Private Key from Websafe (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 15D: Import RSA Private Key from Websafe",
      "en": "Atalla AT1000 Command 15D: Import RSA Private Key from Websafe"
    },
    "description": {
      "es": "Ejecuta la operación de Import RSA Private Key from Websafe en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Import RSA Private Key from Websafe operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Gestión de Claves",
      "en": "Key Management"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Import RSA Private Key from Websafe",
          "en": "Fields and parameters for Import RSA Private Key from Websafe"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 15D (Import RSA Private Key from Websafe)"
  },
  {
    "id": "atalla-15e-req",
    "code": "15E",
    "direction": "request",
    "pairedCode": "25E",
    "name": {
      "es": "Combine Key Components (Petición)",
      "en": "Combine Key Components (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 15E: Combine Key Components",
      "en": "Atalla AT1000 Command 15E: Combine Key Components"
    },
    "description": {
      "es": "Ejecuta la operación de Combine Key Components en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Combine Key Components operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Gestión de Claves",
      "en": "Key Management"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Combine Key Components",
          "en": "Fields and parameters for Combine Key Components"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "notes": [
      {
        "es": "[CAUTION] CAUTION: It is highly recommended that this command be enabled for a specific number of executions. For",
        "en": "[CAUTION] CAUTION: It is highly recommended that this command be enabled for a specific number of executions. For"
      },
      {
        "es": "[CAUTION] information on how to configure the HSM to limit how many times this command can be executed, see the",
        "en": "[CAUTION] information on how to configure the HSM to limit how many times this command can be executed, see the"
      },
      {
        "es": "[CAUTION] Command Count feature which is documented in the Atalla Secure Configuration Assistant User Guide .",
        "en": "[CAUTION] Command Count feature which is documented in the Atalla Secure Configuration Assistant User Guide ."
      },
      {
        "es": "[NOTE] NOTE: This command is only allowed on the NIC1 Print Command Port.",
        "en": "[NOTE] NOTE: This command is only allowed on the NIC1 Print Command Port."
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 15E (Combine Key Components)"
  },
  {
    "id": "atalla-16-req",
    "code": "16",
    "direction": "request",
    "pairedCode": "26",
    "name": {
      "es": "Encrypt Financial Institution Table, Diebold (Petición)",
      "en": "Encrypt Financial Institution Table, Diebold (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 16: Encrypt Financial Institution Table, Diebold",
      "en": "Atalla AT1000 Command 16: Encrypt Financial Institution Table, Diebold"
    },
    "description": {
      "es": "Ejecuta la operación de Encrypt Financial Institution Table, Diebold en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Encrypt Financial Institution Table, Diebold operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Operaciones Criptográficas",
      "en": "Cryptographic Operations"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Encrypt Financial Institution Table, Diebold",
          "en": "Fields and parameters for Encrypt Financial Institution Table, Diebold"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 16 (Encrypt Financial Institution Table, Diebold)"
  },
  {
    "id": "atalla-161-req",
    "code": "161",
    "direction": "request",
    "pairedCode": "261",
    "name": {
      "es": "Print PIN Letter (Petición)",
      "en": "Print PIN Letter (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 161: Print PIN Letter",
      "en": "Atalla AT1000 Command 161: Print PIN Letter"
    },
    "description": {
      "es": "Ejecuta la operación de Print PIN Letter en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Print PIN Letter operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Procesamiento de PIN",
      "en": "PIN Processing"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Print PIN Letter",
          "en": "Fields and parameters for Print PIN Letter"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "notes": [
      {
        "es": "[CAUTION] CAUTION:",
        "en": "[CAUTION] CAUTION:"
      },
      {
        "es": "[CAUTION]  The print job will contain the cleartext PIN. Appropriate security measures are required to ensure that",
        "en": "[CAUTION]  The print job will contain the cleartext PIN. Appropriate security measures are required to ensure that"
      },
      {
        "es": "[CAUTION] only authorized personnel have access to the printer, and that communications between the HSM",
        "en": "[CAUTION] only authorized personnel have access to the printer, and that communications between the HSM"
      },
      {
        "es": "[CAUTION] and the printer are not monitored.",
        "en": "[CAUTION] and the printer are not monitored."
      },
      {
        "es": "[CAUTION]  It is highly recommended that this command be enabled for a specific number of executions. For",
        "en": "[CAUTION]  It is highly recommended that this command be enabled for a specific number of executions. For"
      },
      {
        "es": "[CAUTION] information on how to configure the HSM to limit how many times this command can be executed,",
        "en": "[CAUTION] information on how to configure the HSM to limit how many times this command can be executed,"
      },
      {
        "es": "[CAUTION] see the Command Count feature which is documented in the Atalla Secure Configuration Assistant",
        "en": "[CAUTION] see the Command Count feature which is documented in the Atalla Secure Configuration Assistant"
      },
      {
        "es": "[CAUTION] User Guide.",
        "en": "[CAUTION] User Guide."
      },
      {
        "es": "[NOTE] NOTE: This command is only allowed on the NIC1 Print Command Port.",
        "en": "[NOTE] NOTE: This command is only allowed on the NIC1 Print Command Port."
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 161 (Print PIN Letter)"
  },
  {
    "id": "atalla-162-req",
    "code": "162",
    "direction": "request",
    "pairedCode": "262",
    "name": {
      "es": "PIN Issuance, IBM 3624 Method (Petición)",
      "en": "PIN Issuance, IBM 3624 Method (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 162: PIN Issuance, IBM 3624 Method",
      "en": "Atalla AT1000 Command 162: PIN Issuance, IBM 3624 Method"
    },
    "description": {
      "es": "Ejecuta la operación de PIN Issuance, IBM 3624 Method en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes PIN Issuance, IBM 3624 Method operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Procesamiento de PIN",
      "en": "PIN Processing"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para PIN Issuance, IBM 3624 Method",
          "en": "Fields and parameters for PIN Issuance, IBM 3624 Method"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "notes": [
      {
        "es": "[CAUTION] CAUTION: It is highly recommended that this command be enabled for a specific number of executions. For",
        "en": "[CAUTION] CAUTION: It is highly recommended that this command be enabled for a specific number of executions. For"
      },
      {
        "es": "[CAUTION] information on how to configure the HSM to limit how many times this command can be executed, see the",
        "en": "[CAUTION] information on how to configure the HSM to limit how many times this command can be executed, see the"
      },
      {
        "es": "[CAUTION] Command Count feature which is documented in section 4 of the Atalla Secure Configuration Assistant-3",
        "en": "[CAUTION] Command Count feature which is documented in section 4 of the Atalla Secure Configuration Assistant-3"
      },
      {
        "es": "[CAUTION] User Guide .",
        "en": "[CAUTION] User Guide ."
      },
      {
        "es": "[NOTE] NOTE: This command is only allowed on the NIC1 Print Command Port.",
        "en": "[NOTE] NOTE: This command is only allowed on the NIC1 Print Command Port."
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 162 (PIN Issuance, IBM 3624 Method)"
  },
  {
    "id": "atalla-163-req",
    "code": "163",
    "direction": "request",
    "pairedCode": "263",
    "name": {
      "es": "PIN Issuance, VISA Method (Petición)",
      "en": "PIN Issuance, VISA Method (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 163: PIN Issuance, VISA Method",
      "en": "Atalla AT1000 Command 163: PIN Issuance, VISA Method"
    },
    "description": {
      "es": "Ejecuta la operación de PIN Issuance, VISA Method en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes PIN Issuance, VISA Method operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Procesamiento de PIN",
      "en": "PIN Processing"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para PIN Issuance, VISA Method",
          "en": "Fields and parameters for PIN Issuance, VISA Method"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "notes": [
      {
        "es": "[CAUTION] CAUTION: It is highly recommended that this command be enabled for a specific number of executions. For",
        "en": "[CAUTION] CAUTION: It is highly recommended that this command be enabled for a specific number of executions. For"
      },
      {
        "es": "[CAUTION] information on how to configure the HSM to limit how many times this command can be executed, see the",
        "en": "[CAUTION] information on how to configure the HSM to limit how many times this command can be executed, see the"
      },
      {
        "es": "[CAUTION] Command Count feature which is documented in section 4 of the Atalla Secure Configuration Assistant-3",
        "en": "[CAUTION] Command Count feature which is documented in section 4 of the Atalla Secure Configuration Assistant-3"
      },
      {
        "es": "[CAUTION] User Guide .",
        "en": "[CAUTION] User Guide ."
      },
      {
        "es": "[NOTE] NOTE: This command is only allowed on the NIC1 Print Command Port.",
        "en": "[NOTE] NOTE: This command is only allowed on the NIC1 Print Command Port."
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 163 (PIN Issuance, VISA Method)"
  },
  {
    "id": "atalla-16e-req",
    "code": "16E",
    "direction": "request",
    "pairedCode": "26E",
    "name": {
      "es": "Divide a Key into Components (Petición)",
      "en": "Divide a Key into Components (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 16E: Divide a Key into Components",
      "en": "Atalla AT1000 Command 16E: Divide a Key into Components"
    },
    "description": {
      "es": "Ejecuta la operación de Divide a Key into Components en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Divide a Key into Components operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Gestión de Claves",
      "en": "Key Management"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Divide a Key into Components",
          "en": "Fields and parameters for Divide a Key into Components"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "notes": [
      {
        "es": "[CAUTION] CAUTION: It is highly recommended that this command be enabled for a specific number of executions. For",
        "en": "[CAUTION] CAUTION: It is highly recommended that this command be enabled for a specific number of executions. For"
      },
      {
        "es": "[CAUTION] information on how to configure the HSM to limit how many times this command can be executed, see the",
        "en": "[CAUTION] information on how to configure the HSM to limit how many times this command can be executed, see the"
      },
      {
        "es": "[CAUTION] Command Count feature which is documented in section 4 of the Atalla Secure Configuration Assistant-3",
        "en": "[CAUTION] Command Count feature which is documented in section 4 of the Atalla Secure Configuration Assistant-3"
      },
      {
        "es": "[CAUTION] User Guide .",
        "en": "[CAUTION] User Guide ."
      },
      {
        "es": "[NOTE] NOTE: This command is only allowed on the NIC1 Print Command Port.",
        "en": "[NOTE] NOTE: This command is only allowed on the NIC1 Print Command Port."
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 16E (Divide a Key into Components)"
  },
  {
    "id": "atalla-16f-req",
    "code": "16F",
    "direction": "request",
    "pairedCode": "26F",
    "name": {
      "es": "Print Component Letter (Petición)",
      "en": "Print Component Letter (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 16F: Print Component Letter",
      "en": "Atalla AT1000 Command 16F: Print Component Letter"
    },
    "description": {
      "es": "Ejecuta la operación de Print Component Letter en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Print Component Letter operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Operaciones Criptográficas",
      "en": "Cryptographic Operations"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Print Component Letter",
          "en": "Fields and parameters for Print Component Letter"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "notes": [
      {
        "es": "[CAUTION] CAUTION:",
        "en": "[CAUTION] CAUTION:"
      },
      {
        "es": "[CAUTION]  The print job will contain the cleartext component. Appropriate security measures are required to",
        "en": "[CAUTION]  The print job will contain the cleartext component. Appropriate security measures are required to"
      },
      {
        "es": "[CAUTION] ensure that only authorized personnel have access to the printer, and that communications between",
        "en": "[CAUTION] ensure that only authorized personnel have access to the printer, and that communications between"
      },
      {
        "es": "[CAUTION] the HSM and the printer are not monitored.",
        "en": "[CAUTION] the HSM and the printer are not monitored."
      },
      {
        "es": "[CAUTION]  It is highly recommended that this command be enabled for a specific number of executions. For",
        "en": "[CAUTION]  It is highly recommended that this command be enabled for a specific number of executions. For"
      },
      {
        "es": "[CAUTION] information on how to configure the HSM to limit how many times this command can be executed,",
        "en": "[CAUTION] information on how to configure the HSM to limit how many times this command can be executed,"
      },
      {
        "es": "[CAUTION] see the Command Count feature which is documented in section 4 of the Atalla Secure Configuration",
        "en": "[CAUTION] see the Command Count feature which is documented in section 4 of the Atalla Secure Configuration"
      },
      {
        "es": "[CAUTION] Assistant-3 User Guide.",
        "en": "[CAUTION] Assistant-3 User Guide."
      },
      {
        "es": "[NOTE] NOTE: This command is only allowed on the NIC1 Print Command Port.",
        "en": "[NOTE] NOTE: This command is only allowed on the NIC1 Print Command Port."
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 16F (Print Component Letter)"
  },
  {
    "id": "atalla-178-req",
    "code": "178",
    "direction": "request",
    "pairedCode": "278",
    "name": {
      "es": "Verify EMV AES ARQC (Petición)",
      "en": "Verify EMV AES ARQC (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 178: Verify EMV AES ARQC",
      "en": "Atalla AT1000 Command 178: Verify EMV AES ARQC"
    },
    "description": {
      "es": "Ejecuta la operación de Verify EMV AES ARQC en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Verify EMV AES ARQC operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Tarjetas y EMV",
      "en": "Cards & EMV"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Verify EMV AES ARQC",
          "en": "Fields and parameters for Verify EMV AES ARQC"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 178 (Verify EMV AES ARQC)"
  },
  {
    "id": "atalla-179-req",
    "code": "179",
    "direction": "request",
    "pairedCode": "279",
    "name": {
      "es": "Generate EMV AES MAC (Petición)",
      "en": "Generate EMV AES MAC (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 179: Generate EMV AES MAC",
      "en": "Atalla AT1000 Command 179: Generate EMV AES MAC"
    },
    "description": {
      "es": "Ejecuta la operación de Generate EMV AES MAC en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Generate EMV AES MAC operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Autenticación y MAC",
      "en": "Authentication & MAC"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Generate EMV AES MAC",
          "en": "Fields and parameters for Generate EMV AES MAC"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 179 (Generate EMV AES MAC)"
  },
  {
    "id": "atalla-17b-req",
    "code": "17B",
    "direction": "request",
    "pairedCode": "27B",
    "name": {
      "es": "EMV AES ICC Master Key for Export (Petición)",
      "en": "EMV AES ICC Master Key for Export (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 17B: EMV AES ICC Master Key for Export",
      "en": "Atalla AT1000 Command 17B: EMV AES ICC Master Key for Export"
    },
    "description": {
      "es": "Ejecuta la operación de EMV AES ICC Master Key for Export en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes EMV AES ICC Master Key for Export operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Gestión de Claves",
      "en": "Key Management"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para EMV AES ICC Master Key for Export",
          "en": "Fields and parameters for EMV AES ICC Master Key for Export"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 17B (EMV AES ICC Master Key for Export)"
  },
  {
    "id": "atalla-18-req",
    "code": "18",
    "direction": "request",
    "pairedCode": "28",
    "name": {
      "es": "Generate Visa Working Key (Petición)",
      "en": "Generate Visa Working Key (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 18: Generate Visa Working Key",
      "en": "Atalla AT1000 Command 18: Generate Visa Working Key"
    },
    "description": {
      "es": "Ejecuta la operación de Generate Visa Working Key en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Generate Visa Working Key operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Gestión de Claves",
      "en": "Key Management"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Generate Visa Working Key",
          "en": "Fields and parameters for Generate Visa Working Key"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 18 (Generate Visa Working Key)"
  },
  {
    "id": "atalla-182-req",
    "code": "182",
    "direction": "request",
    "pairedCode": "282",
    "name": {
      "es": "Recover PIN from offset (Petición)",
      "en": "Recover PIN from offset (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 182: Recover PIN from offset",
      "en": "Atalla AT1000 Command 182: Recover PIN from offset"
    },
    "description": {
      "es": "Ejecuta la operación de Recover PIN from offset en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Recover PIN from offset operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Procesamiento de PIN",
      "en": "PIN Processing"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Recover PIN from offset",
          "en": "Fields and parameters for Recover PIN from offset"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 182 (Recover PIN from offset)"
  },
  {
    "id": "atalla-185-req",
    "code": "185",
    "direction": "request",
    "pairedCode": "285",
    "name": {
      "es": "Establish Secure Session with Chip Card (Petición)",
      "en": "Establish Secure Session with Chip Card (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 185: Establish Secure Session with Chip Card",
      "en": "Atalla AT1000 Command 185: Establish Secure Session with Chip Card"
    },
    "description": {
      "es": "Ejecuta la operación de Establish Secure Session with Chip Card en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Establish Secure Session with Chip Card operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Tarjetas y EMV",
      "en": "Cards & EMV"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Establish Secure Session with Chip Card",
          "en": "Fields and parameters for Establish Secure Session with Chip Card"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 185 (Establish Secure Session with Chip Card)"
  },
  {
    "id": "atalla-187-req",
    "code": "187",
    "direction": "request",
    "pairedCode": "287",
    "name": {
      "es": "Verify R-MAC and Decrypt Response Secure Message from Chip Card (Petición)",
      "en": "Verify R-MAC and Decrypt Response Secure Message from Chip Card (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 187: Verify R-MAC and Decrypt Response Secure Message from Chip Card",
      "en": "Atalla AT1000 Command 187: Verify R-MAC and Decrypt Response Secure Message from Chip Card"
    },
    "description": {
      "es": "Ejecuta la operación de Verify R-MAC and Decrypt Response Secure Message from Chip Card en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Verify R-MAC and Decrypt Response Secure Message from Chip Card operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Autenticación y MAC",
      "en": "Authentication & MAC"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Verify R-MAC and Decrypt Response Secure Message from Chip Card",
          "en": "Fields and parameters for Verify R-MAC and Decrypt Response Secure Message from Chip Card"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 187 (Verify R-MAC and Decrypt Response Secure Message from Chip Card)"
  },
  {
    "id": "atalla-188-req",
    "code": "188",
    "direction": "request",
    "pairedCode": "288",
    "name": {
      "es": "Generate CEK and Export with JWE Symmetric Key Wrap (Petición)",
      "en": "Generate CEK and Export with JWE Symmetric Key Wrap (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 188: Generate CEK and Export with JWE Symmetric Key Wrap",
      "en": "Atalla AT1000 Command 188: Generate CEK and Export with JWE Symmetric Key Wrap"
    },
    "description": {
      "es": "Ejecuta la operación de Generate CEK and Export with JWE Symmetric Key Wrap en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Generate CEK and Export with JWE Symmetric Key Wrap operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Gestión de Claves",
      "en": "Key Management"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Generate CEK and Export with JWE Symmetric Key Wrap",
          "en": "Fields and parameters for Generate CEK and Export with JWE Symmetric Key Wrap"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 188 (Generate CEK and Export with JWE Symmetric Key Wrap)"
  },
  {
    "id": "atalla-189-req",
    "code": "189",
    "direction": "request",
    "pairedCode": "289",
    "name": {
      "es": "Import JWE Wrapped Symmetric Key (Petición)",
      "en": "Import JWE Wrapped Symmetric Key (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 189: Import JWE Wrapped Symmetric Key",
      "en": "Atalla AT1000 Command 189: Import JWE Wrapped Symmetric Key"
    },
    "description": {
      "es": "Ejecuta la operación de Import JWE Wrapped Symmetric Key en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Import JWE Wrapped Symmetric Key operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Gestión de Claves",
      "en": "Key Management"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Import JWE Wrapped Symmetric Key",
          "en": "Fields and parameters for Import JWE Wrapped Symmetric Key"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "notes": [
      {
        "es": "[NOTE] NOTE: The command generates a random CEK, therefore the response will be different every time the",
        "en": "[NOTE] NOTE: The command generates a random CEK, therefore the response will be different every time the"
      },
      {
        "es": "[NOTE] command is executed.",
        "en": "[NOTE] command is executed."
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 189 (Import JWE Wrapped Symmetric Key)"
  },
  {
    "id": "atalla-18a-req",
    "code": "18A",
    "direction": "request",
    "pairedCode": "28A",
    "name": {
      "es": "Derive ICC Key Set (Petición)",
      "en": "Derive ICC Key Set (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 18A: Derive ICC Key Set",
      "en": "Atalla AT1000 Command 18A: Derive ICC Key Set"
    },
    "description": {
      "es": "Ejecuta la operación de Derive ICC Key Set en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Derive ICC Key Set operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Gestión de Claves",
      "en": "Key Management"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Derive ICC Key Set",
          "en": "Fields and parameters for Derive ICC Key Set"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 18A (Derive ICC Key Set)"
  },
  {
    "id": "atalla-18b-req",
    "code": "18B",
    "direction": "request",
    "pairedCode": "28B",
    "name": {
      "es": "Translate Sensitive Data for Personalization (Petición)",
      "en": "Translate Sensitive Data for Personalization (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 18B: Translate Sensitive Data for Personalization",
      "en": "Atalla AT1000 Command 18B: Translate Sensitive Data for Personalization"
    },
    "description": {
      "es": "Ejecuta la operación de Translate Sensitive Data for Personalization en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Translate Sensitive Data for Personalization operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Operaciones Criptográficas",
      "en": "Cryptographic Operations"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Translate Sensitive Data for Personalization",
          "en": "Fields and parameters for Translate Sensitive Data for Personalization"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 18B (Translate Sensitive Data for Personalization)"
  },
  {
    "id": "atalla-18c-req",
    "code": "18C",
    "direction": "request",
    "pairedCode": "28C",
    "name": {
      "es": "Protect Secure Message for Chip Card (Petición)",
      "en": "Protect Secure Message for Chip Card (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 18C: Protect Secure Message for Chip Card",
      "en": "Atalla AT1000 Command 18C: Protect Secure Message for Chip Card"
    },
    "description": {
      "es": "Ejecuta la operación de Protect Secure Message for Chip Card en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Protect Secure Message for Chip Card operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Tarjetas y EMV",
      "en": "Cards & EMV"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Protect Secure Message for Chip Card",
          "en": "Fields and parameters for Protect Secure Message for Chip Card"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 18C (Protect Secure Message for Chip Card)"
  },
  {
    "id": "atalla-19-req",
    "code": "19",
    "direction": "request",
    "pairedCode": "29",
    "name": {
      "es": "Translate Working Key for Local Storage (Petición)",
      "en": "Translate Working Key for Local Storage (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 19: Translate Working Key for Local Storage",
      "en": "Atalla AT1000 Command 19: Translate Working Key for Local Storage"
    },
    "description": {
      "es": "Ejecuta la operación de Translate Working Key for Local Storage en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Translate Working Key for Local Storage operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Gestión de Claves",
      "en": "Key Management"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Translate Working Key for Local Storage",
          "en": "Fields and parameters for Translate Working Key for Local Storage"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 19 (Translate Working Key for Local Storage)"
  },
  {
    "id": "atalla-1a-req",
    "code": "1A",
    "direction": "request",
    "pairedCode": "2A",
    "name": {
      "es": "Export a 3DES key in non-AKB Format (Petición)",
      "en": "Export a 3DES key in non-AKB Format (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 1A: Export a 3DES key in non-AKB Format",
      "en": "Atalla AT1000 Command 1A: Export a 3DES key in non-AKB Format"
    },
    "description": {
      "es": "Ejecuta la operación de Export a 3DES key in non-AKB Format en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Export a 3DES key in non-AKB Format operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Gestión de Claves",
      "en": "Key Management"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Export a 3DES key in non-AKB Format",
          "en": "Fields and parameters for Export a 3DES key in non-AKB Format"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "notes": [
      {
        "es": "[NOTE] NOTE: This command is deprecated. Use commands 11A or 311 to exchange symmetric keys via TR-31.",
        "en": "[NOTE] NOTE: This command is deprecated. Use commands 11A or 311 to exchange symmetric keys via TR-31."
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 1A (Export a 3DES key in non-AKB Format)"
  },
  {
    "id": "atalla-1d-req",
    "code": "1D",
    "direction": "request",
    "pairedCode": "2D",
    "name": {
      "es": "Translate Communications Key for Local Storage, Specific Variant (Petición)",
      "en": "Translate Communications Key for Local Storage, Specific Variant (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 1D: Translate Communications Key for Local Storage, Specific Variant",
      "en": "Atalla AT1000 Command 1D: Translate Communications Key for Local Storage, Specific Variant"
    },
    "description": {
      "es": "Ejecuta la operación de Translate Communications Key for Local Storage, Specific Variant en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Translate Communications Key for Local Storage, Specific Variant operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Gestión de Claves",
      "en": "Key Management"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Translate Communications Key for Local Storage, Specific Variant",
          "en": "Fields and parameters for Translate Communications Key for Local Storage, Specific Variant"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 1D (Translate Communications Key for Local Storage, Specific Variant)"
  },
  {
    "id": "atalla-1e-req",
    "code": "1E",
    "direction": "request",
    "pairedCode": "2E",
    "name": {
      "es": "Generate New Initial Key for PIN Pad Using Visa DUKPT (Petición)",
      "en": "Generate New Initial Key for PIN Pad Using Visa DUKPT (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 1E: Generate New Initial Key for PIN Pad Using Visa DUKPT",
      "en": "Atalla AT1000 Command 1E: Generate New Initial Key for PIN Pad Using Visa DUKPT"
    },
    "description": {
      "es": "Ejecuta la operación de Generate New Initial Key for PIN Pad Using Visa DUKPT en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Generate New Initial Key for PIN Pad Using Visa DUKPT operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Procesamiento de PIN",
      "en": "PIN Processing"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Generate New Initial Key for PIN Pad Using Visa DUKPT",
          "en": "Fields and parameters for Generate New Initial Key for PIN Pad Using Visa DUKPT"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "notes": [
      {
        "es": "[NOTE] NOTE: This command supports an obsolete/proprietary technique for key loading and is not compatible with",
        "en": "[NOTE] NOTE: This command supports an obsolete/proprietary technique for key loading and is not compatible with"
      },
      {
        "es": "[NOTE] any current POS terminals. It is not required or recommended in any DUKPT environment.",
        "en": "[NOTE] any current POS terminals. It is not required or recommended in any DUKPT environment."
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 1E (Generate New Initial Key for PIN Pad Using Visa DUKPT)"
  },
  {
    "id": "atalla-30-req",
    "code": "30",
    "direction": "request",
    "pairedCode": "40",
    "name": {
      "es": "Encrypt PIN, ANSI Format 0 (Petición)",
      "en": "Encrypt PIN, ANSI Format 0 (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 30: Encrypt PIN, ANSI Format 0",
      "en": "Atalla AT1000 Command 30: Encrypt PIN, ANSI Format 0"
    },
    "description": {
      "es": "Ejecuta la operación de Encrypt PIN, ANSI Format 0 en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Encrypt PIN, ANSI Format 0 operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Procesamiento de PIN",
      "en": "PIN Processing"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Encrypt PIN, ANSI Format 0",
          "en": "Fields and parameters for Encrypt PIN, ANSI Format 0"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "notes": [
      {
        "es": "[CAUTION] CAUTION: This command processes a clear PIN, it creates a significant security exposure.",
        "en": "[CAUTION] CAUTION: This command processes a clear PIN, it creates a significant security exposure."
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 30 (Encrypt PIN, ANSI Format 0)"
  },
  {
    "id": "atalla-304-req",
    "code": "304",
    "direction": "request",
    "pairedCode": "404",
    "name": {
      "es": "Verify MAC using CMAC (Petición)",
      "en": "Verify MAC using CMAC (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 304: Verify MAC using CMAC",
      "en": "Atalla AT1000 Command 304: Verify MAC using CMAC"
    },
    "description": {
      "es": "Ejecuta la operación de Verify MAC using CMAC en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Verify MAC using CMAC operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Autenticación y MAC",
      "en": "Authentication & MAC"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Verify MAC using CMAC",
          "en": "Fields and parameters for Verify MAC using CMAC"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 304 (Verify MAC using CMAC)"
  },
  {
    "id": "atalla-305-req",
    "code": "305",
    "direction": "request",
    "pairedCode": "405",
    "name": {
      "es": "Generate MAC using CMAC (Petición)",
      "en": "Generate MAC using CMAC (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 305: Generate MAC using CMAC",
      "en": "Atalla AT1000 Command 305: Generate MAC using CMAC"
    },
    "description": {
      "es": "Ejecuta la operación de Generate MAC using CMAC en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Generate MAC using CMAC operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Autenticación y MAC",
      "en": "Authentication & MAC"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Generate MAC using CMAC",
          "en": "Fields and parameters for Generate MAC using CMAC"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 305 (Generate MAC using CMAC)"
  },
  {
    "id": "atalla-30a-req",
    "code": "30A",
    "direction": "request",
    "pairedCode": "40A",
    "name": {
      "es": "Calculate PIN Offset (Petición)",
      "en": "Calculate PIN Offset (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 30A: Calculate PIN Offset",
      "en": "Atalla AT1000 Command 30A: Calculate PIN Offset"
    },
    "description": {
      "es": "Ejecuta la operación de Calculate PIN Offset en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Calculate PIN Offset operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Procesamiento de PIN",
      "en": "PIN Processing"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Calculate PIN Offset",
          "en": "Fields and parameters for Calculate PIN Offset"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 30A (Calculate PIN Offset)"
  },
  {
    "id": "atalla-310-req",
    "code": "310",
    "direction": "request",
    "pairedCode": "410",
    "name": {
      "es": "Import TR-31 Formatted Working Key, version D (AES) (Petición)",
      "en": "Import TR-31 Formatted Working Key, version D (AES) (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 310: Import TR-31 Formatted Working Key, version D (AES)",
      "en": "Atalla AT1000 Command 310: Import TR-31 Formatted Working Key, version D (AES)"
    },
    "description": {
      "es": "Ejecuta la operación de Import TR-31 Formatted Working Key, version D (AES) en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Import TR-31 Formatted Working Key, version D (AES) operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Diagnóstico y Sistema",
      "en": "Diagnostics & System"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Import TR-31 Formatted Working Key, version D (AES)",
          "en": "Fields and parameters for Import TR-31 Formatted Working Key, version D (AES)"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 310 (Import TR-31 Formatted Working Key, version D (AES))"
  },
  {
    "id": "atalla-311-req",
    "code": "311",
    "direction": "request",
    "pairedCode": "411",
    "name": {
      "es": "Export Working Key in TR-31 Format, version D (AES) (Petición)",
      "en": "Export Working Key in TR-31 Format, version D (AES) (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 311: Export Working Key in TR-31 Format, version D (AES)",
      "en": "Atalla AT1000 Command 311: Export Working Key in TR-31 Format, version D (AES)"
    },
    "description": {
      "es": "Ejecuta la operación de Export Working Key in TR-31 Format, version D (AES) en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Export Working Key in TR-31 Format, version D (AES) operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Diagnóstico y Sistema",
      "en": "Diagnostics & System"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Export Working Key in TR-31 Format, version D (AES)",
          "en": "Fields and parameters for Export Working Key in TR-31 Format, version D (AES)"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 311 (Export Working Key in TR-31 Format, version D (AES))"
  },
  {
    "id": "atalla-312-req",
    "code": "312",
    "direction": "request",
    "pairedCode": "412",
    "name": {
      "es": "Generate PAN Binding Token (Petición)",
      "en": "Generate PAN Binding Token (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 312: Generate PAN Binding Token",
      "en": "Atalla AT1000 Command 312: Generate PAN Binding Token"
    },
    "description": {
      "es": "Ejecuta la operación de Generate PAN Binding Token en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Generate PAN Binding Token operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Operaciones Criptográficas",
      "en": "Cryptographic Operations"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Generate PAN Binding Token",
          "en": "Fields and parameters for Generate PAN Binding Token"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 312 (Generate PAN Binding Token)"
  },
  {
    "id": "atalla-313-req",
    "code": "313",
    "direction": "request",
    "pairedCode": "413",
    "name": {
      "es": "Verify PAN Binding Token (Petición)",
      "en": "Verify PAN Binding Token (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 313: Verify PAN Binding Token",
      "en": "Atalla AT1000 Command 313: Verify PAN Binding Token"
    },
    "description": {
      "es": "Ejecuta la operación de Verify PAN Binding Token en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Verify PAN Binding Token operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Operaciones Criptográficas",
      "en": "Cryptographic Operations"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Verify PAN Binding Token",
          "en": "Fields and parameters for Verify PAN Binding Token"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 313 (Verify PAN Binding Token)"
  },
  {
    "id": "atalla-32-req",
    "code": "32",
    "direction": "request",
    "pairedCode": "42",
    "name": {
      "es": "Verify PIN, Atalla 2x2 (Petición)",
      "en": "Verify PIN, Atalla 2x2 (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 32: Verify PIN, Atalla 2x2",
      "en": "Atalla AT1000 Command 32: Verify PIN, Atalla 2x2"
    },
    "description": {
      "es": "Ejecuta la operación de Verify PIN, Atalla 2x2 en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Verify PIN, Atalla 2x2 operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Procesamiento de PIN",
      "en": "PIN Processing"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Verify PIN, Atalla 2x2",
          "en": "Fields and parameters for Verify PIN, Atalla 2x2"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "notes": [
      {
        "es": "[CAUTION] CAUTION: This command processes a clear PIN, it creates a significant security exposure.",
        "en": "[CAUTION] CAUTION: This command processes a clear PIN, it creates a significant security exposure."
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 32 (Verify PIN, Atalla 2x2)"
  },
  {
    "id": "atalla-324-req",
    "code": "324",
    "direction": "request",
    "pairedCode": "424",
    "name": {
      "es": "Receive APACS 40 Request Message (Petición)",
      "en": "Receive APACS 40 Request Message (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 324: Receive APACS 40 Request Message",
      "en": "Atalla AT1000 Command 324: Receive APACS 40 Request Message"
    },
    "description": {
      "es": "Ejecuta la operación de Receive APACS 40 Request Message en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Receive APACS 40 Request Message operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Operaciones Criptográficas",
      "en": "Cryptographic Operations"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Receive APACS 40 Request Message",
          "en": "Fields and parameters for Receive APACS 40 Request Message"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 324 (Receive APACS 40 Request Message)"
  },
  {
    "id": "atalla-325-req",
    "code": "325",
    "direction": "request",
    "pairedCode": "425",
    "name": {
      "es": "Generate APACS 40 Response Message (Petición)",
      "en": "Generate APACS 40 Response Message (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 325: Generate APACS 40 Response Message",
      "en": "Atalla AT1000 Command 325: Generate APACS 40 Response Message"
    },
    "description": {
      "es": "Ejecuta la operación de Generate APACS 40 Response Message en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Generate APACS 40 Response Message operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Operaciones Criptográficas",
      "en": "Cryptographic Operations"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Generate APACS 40 Response Message",
          "en": "Fields and parameters for Generate APACS 40 Response Message"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 325 (Generate APACS 40 Response Message)"
  },
  {
    "id": "atalla-326-req",
    "code": "326",
    "direction": "request",
    "pairedCode": "426",
    "name": {
      "es": "Verify APACS 40 Confirmation Message (Petición)",
      "en": "Verify APACS 40 Confirmation Message (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 326: Verify APACS 40 Confirmation Message",
      "en": "Atalla AT1000 Command 326: Verify APACS 40 Confirmation Message"
    },
    "description": {
      "es": "Ejecuta la operación de Verify APACS 40 Confirmation Message en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Verify APACS 40 Confirmation Message operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Operaciones Criptográficas",
      "en": "Cryptographic Operations"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Verify APACS 40 Confirmation Message",
          "en": "Fields and parameters for Verify APACS 40 Confirmation Message"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 326 (Verify APACS 40 Confirmation Message)"
  },
  {
    "id": "atalla-32c-req",
    "code": "32C",
    "direction": "request",
    "pairedCode": "42C",
    "name": {
      "es": "Verify ePIN (Petición)",
      "en": "Verify ePIN (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 32C: Verify ePIN",
      "en": "Atalla AT1000 Command 32C: Verify ePIN"
    },
    "description": {
      "es": "Ejecuta la operación de Verify ePIN en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Verify ePIN operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Procesamiento de PIN",
      "en": "PIN Processing"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Verify ePIN",
          "en": "Fields and parameters for Verify ePIN"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 32C (Verify ePIN)"
  },
  {
    "id": "atalla-33-req",
    "code": "33",
    "direction": "request",
    "pairedCode": "43",
    "name": {
      "es": "Translate PIN, ANSI to ANSI (Petición)",
      "en": "Translate PIN, ANSI to ANSI (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 33: Translate PIN, ANSI to ANSI",
      "en": "Atalla AT1000 Command 33: Translate PIN, ANSI to ANSI"
    },
    "description": {
      "es": "Ejecuta la operación de Translate PIN, ANSI to ANSI en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Translate PIN, ANSI to ANSI operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Procesamiento de PIN",
      "en": "PIN Processing"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Translate PIN, ANSI to ANSI",
          "en": "Fields and parameters for Translate PIN, ANSI to ANSI"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 33 (Translate PIN, ANSI to ANSI)"
  },
  {
    "id": "atalla-335-req",
    "code": "335",
    "direction": "request",
    "pairedCode": "435",
    "name": {
      "es": "PIN and PIN-Block Translate (Petición)",
      "en": "PIN and PIN-Block Translate (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 335: PIN and PIN-Block Translate",
      "en": "Atalla AT1000 Command 335: PIN and PIN-Block Translate"
    },
    "description": {
      "es": "Ejecuta la operación de PIN and PIN-Block Translate en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes PIN and PIN-Block Translate operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Procesamiento de PIN",
      "en": "PIN Processing"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para PIN and PIN-Block Translate",
          "en": "Fields and parameters for PIN and PIN-Block Translate"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 335 (PIN and PIN-Block Translate)"
  },
  {
    "id": "atalla-346-req",
    "code": "346",
    "direction": "request",
    "pairedCode": "446",
    "name": {
      "es": "PIN Translate - DUKPT to 3DES and Verify MAC (Petición)",
      "en": "PIN Translate - DUKPT to 3DES and Verify MAC (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 346: PIN Translate - DUKPT to 3DES and Verify MAC",
      "en": "Atalla AT1000 Command 346: PIN Translate - DUKPT to 3DES and Verify MAC"
    },
    "description": {
      "es": "Ejecuta la operación de PIN Translate - DUKPT to 3DES and Verify MAC en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes PIN Translate - DUKPT to 3DES and Verify MAC operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Procesamiento de PIN",
      "en": "PIN Processing"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para PIN Translate - DUKPT to 3DES and Verify MAC",
          "en": "Fields and parameters for PIN Translate - DUKPT to 3DES and Verify MAC"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 346 (PIN Translate - DUKPT to 3DES and Verify MAC)"
  },
  {
    "id": "atalla-347-req",
    "code": "347",
    "direction": "request",
    "pairedCode": "447",
    "name": {
      "es": "PIN Translate - DUKPT to 3DES and Generate MAC (Petición)",
      "en": "PIN Translate - DUKPT to 3DES and Generate MAC (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 347: PIN Translate - DUKPT to 3DES and Generate MAC",
      "en": "Atalla AT1000 Command 347: PIN Translate - DUKPT to 3DES and Generate MAC"
    },
    "description": {
      "es": "Ejecuta la operación de PIN Translate - DUKPT to 3DES and Generate MAC en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes PIN Translate - DUKPT to 3DES and Generate MAC operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Procesamiento de PIN",
      "en": "PIN Processing"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para PIN Translate - DUKPT to 3DES and Generate MAC",
          "en": "Fields and parameters for PIN Translate - DUKPT to 3DES and Generate MAC"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 347 (PIN Translate - DUKPT to 3DES and Generate MAC)"
  },
  {
    "id": "atalla-348-req",
    "code": "348",
    "direction": "request",
    "pairedCode": "448",
    "name": {
      "es": "Verify DUKPT MAC (Petición)",
      "en": "Verify DUKPT MAC (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 348: Verify DUKPT MAC",
      "en": "Atalla AT1000 Command 348: Verify DUKPT MAC"
    },
    "description": {
      "es": "Ejecuta la operación de Verify DUKPT MAC en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Verify DUKPT MAC operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Procesamiento de PIN",
      "en": "PIN Processing"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Verify DUKPT MAC",
          "en": "Fields and parameters for Verify DUKPT MAC"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 348 (Verify DUKPT MAC)"
  },
  {
    "id": "atalla-35-req",
    "code": "35",
    "direction": "request",
    "pairedCode": "45",
    "name": {
      "es": "Translate PIN, Double-Encrypted Input or Output (Petición)",
      "en": "Translate PIN, Double-Encrypted Input or Output (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 35: Translate PIN, Double-Encrypted Input or Output",
      "en": "Atalla AT1000 Command 35: Translate PIN, Double-Encrypted Input or Output"
    },
    "description": {
      "es": "Ejecuta la operación de Translate PIN, Double-Encrypted Input or Output en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Translate PIN, Double-Encrypted Input or Output operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Procesamiento de PIN",
      "en": "PIN Processing"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Translate PIN, Double-Encrypted Input or Output",
          "en": "Fields and parameters for Translate PIN, Double-Encrypted Input or Output"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 35 (Translate PIN, Double-Encrypted Input or Output)"
  },
  {
    "id": "atalla-350-req",
    "code": "350",
    "direction": "request",
    "pairedCode": "450",
    "name": {
      "es": "Verify EMV ARQC (Petición)",
      "en": "Verify EMV ARQC (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 350: Verify EMV ARQC",
      "en": "Atalla AT1000 Command 350: Verify EMV ARQC"
    },
    "description": {
      "es": "Ejecuta la operación de Verify EMV ARQC en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Verify EMV ARQC operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Tarjetas y EMV",
      "en": "Cards & EMV"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Verify EMV ARQC",
          "en": "Fields and parameters for Verify EMV ARQC"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 350 (Verify EMV ARQC)"
  },
  {
    "id": "atalla-351-req",
    "code": "351",
    "direction": "request",
    "pairedCode": "451",
    "name": {
      "es": "EMV PIN Change (Petición)",
      "en": "EMV PIN Change (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 351: EMV PIN Change",
      "en": "Atalla AT1000 Command 351: EMV PIN Change"
    },
    "description": {
      "es": "Ejecuta la operación de EMV PIN Change en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes EMV PIN Change operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Procesamiento de PIN",
      "en": "PIN Processing"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para EMV PIN Change",
          "en": "Fields and parameters for EMV PIN Change"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 351 (EMV PIN Change)"
  },
  {
    "id": "atalla-352-req",
    "code": "352",
    "direction": "request",
    "pairedCode": "452",
    "name": {
      "es": "Generate EMV MAC (Petición)",
      "en": "Generate EMV MAC (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 352: Generate EMV MAC",
      "en": "Atalla AT1000 Command 352: Generate EMV MAC"
    },
    "description": {
      "es": "Ejecuta la operación de Generate EMV MAC en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Generate EMV MAC operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Autenticación y MAC",
      "en": "Authentication & MAC"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Generate EMV MAC",
          "en": "Fields and parameters for Generate EMV MAC"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 352 (Generate EMV MAC)"
  },
  {
    "id": "atalla-354-req",
    "code": "354",
    "direction": "request",
    "pairedCode": "454",
    "name": {
      "es": "Generate EMV ICC Master Key (Petición)",
      "en": "Generate EMV ICC Master Key (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 354: Generate EMV ICC Master Key",
      "en": "Atalla AT1000 Command 354: Generate EMV ICC Master Key"
    },
    "description": {
      "es": "Ejecuta la operación de Generate EMV ICC Master Key en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Generate EMV ICC Master Key operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Gestión de Claves",
      "en": "Key Management"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Generate EMV ICC Master Key",
          "en": "Fields and parameters for Generate EMV ICC Master Key"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 354 (Generate EMV ICC Master Key)"
  },
  {
    "id": "atalla-356-req",
    "code": "356",
    "direction": "request",
    "pairedCode": "456",
    "name": {
      "es": "Validate CAP Token (Petición)",
      "en": "Validate CAP Token (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 356: Validate CAP Token",
      "en": "Atalla AT1000 Command 356: Validate CAP Token"
    },
    "description": {
      "es": "Ejecuta la operación de Validate CAP Token en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Validate CAP Token operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Operaciones Criptográficas",
      "en": "Cryptographic Operations"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Validate CAP Token",
          "en": "Fields and parameters for Validate CAP Token"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 356 (Validate CAP Token)"
  },
  {
    "id": "atalla-357-req",
    "code": "357",
    "direction": "request",
    "pairedCode": "457",
    "name": {
      "es": "Verify dCVV and dCVV2 (Petición)",
      "en": "Verify dCVV and dCVV2 (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 357: Verify dCVV and dCVV2",
      "en": "Atalla AT1000 Command 357: Verify dCVV and dCVV2"
    },
    "description": {
      "es": "Ejecuta la operación de Verify dCVV and dCVV2 en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Verify dCVV and dCVV2 operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Operaciones Criptográficas",
      "en": "Cryptographic Operations"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Verify dCVV and dCVV2",
          "en": "Fields and parameters for Verify dCVV and dCVV2"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "notes": [
      {
        "es": "[CAUTION] CAUTION: Option CA allow HSM to emulate smart card. Emulating a smart card with an HSM should be",
        "en": "[CAUTION] CAUTION: Option CA allow HSM to emulate smart card. Emulating a smart card with an HSM should be"
      },
      {
        "es": "[CAUTION] limited to test scenarios. Utimaco does not recommend enabling option CA in production systems.",
        "en": "[CAUTION] limited to test scenarios. Utimaco does not recommend enabling option CA in production systems."
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 357 (Verify dCVV and dCVV2)"
  },
  {
    "id": "atalla-358-req",
    "code": "358",
    "direction": "request",
    "pairedCode": "458",
    "name": {
      "es": "Generate ISO/IEC 9796-2 Digital Signature (Petición)",
      "en": "Generate ISO/IEC 9796-2 Digital Signature (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 358: Generate ISO/IEC 9796-2 Digital Signature",
      "en": "Atalla AT1000 Command 358: Generate ISO/IEC 9796-2 Digital Signature"
    },
    "description": {
      "es": "Ejecuta la operación de Generate ISO/IEC 9796-2 Digital Signature en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Generate ISO/IEC 9796-2 Digital Signature operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Operaciones Criptográficas",
      "en": "Cryptographic Operations"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Generate ISO/IEC 9796-2 Digital Signature",
          "en": "Fields and parameters for Generate ISO/IEC 9796-2 Digital Signature"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 358 (Generate ISO/IEC 9796-2 Digital Signature)"
  },
  {
    "id": "atalla-359-req",
    "code": "359",
    "direction": "request",
    "pairedCode": "459",
    "name": {
      "es": "MasterCard dynamic CVC3 Verify and IVCVC3 Generate (Petición)",
      "en": "MasterCard dynamic CVC3 Verify and IVCVC3 Generate (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 359: MasterCard dynamic CVC3 Verify and IVCVC3 Generate",
      "en": "Atalla AT1000 Command 359: MasterCard dynamic CVC3 Verify and IVCVC3 Generate"
    },
    "description": {
      "es": "Ejecuta la operación de MasterCard dynamic CVC3 Verify and IVCVC3 Generate en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes MasterCard dynamic CVC3 Verify and IVCVC3 Generate operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Tarjetas y EMV",
      "en": "Cards & EMV"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para MasterCard dynamic CVC3 Verify and IVCVC3 Generate",
          "en": "Fields and parameters for MasterCard dynamic CVC3 Verify and IVCVC3 Generate"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "notes": [
      {
        "es": "[CAUTION] CAUTION: Option CA allow HSM to emulate smart card. Emulating a smart card with an HSM should be",
        "en": "[CAUTION] CAUTION: Option CA allow HSM to emulate smart card. Emulating a smart card with an HSM should be"
      },
      {
        "es": "[CAUTION] limited to test scenarios. Utimaco does not recommend enabling option CA in production systems.",
        "en": "[CAUTION] limited to test scenarios. Utimaco does not recommend enabling option CA in production systems."
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 359 (MasterCard dynamic CVC3 Verify and IVCVC3 Generate)"
  },
  {
    "id": "atalla-35a-req",
    "code": "35A",
    "direction": "request",
    "pairedCode": "45A",
    "name": {
      "es": "Verify AMEX CSC (Petición)",
      "en": "Verify AMEX CSC (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 35A: Verify AMEX CSC",
      "en": "Atalla AT1000 Command 35A: Verify AMEX CSC"
    },
    "description": {
      "es": "Ejecuta la operación de Verify AMEX CSC en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Verify AMEX CSC operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Operaciones Criptográficas",
      "en": "Cryptographic Operations"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Verify AMEX CSC",
          "en": "Fields and parameters for Verify AMEX CSC"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 35A (Verify AMEX CSC)"
  },
  {
    "id": "atalla-35b-req",
    "code": "35B",
    "direction": "request",
    "pairedCode": "45B",
    "name": {
      "es": "Generate AMEX CSC (Petición)",
      "en": "Generate AMEX CSC (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 35B: Generate AMEX CSC",
      "en": "Atalla AT1000 Command 35B: Generate AMEX CSC"
    },
    "description": {
      "es": "Ejecuta la operación de Generate AMEX CSC en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Generate AMEX CSC operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Operaciones Criptográficas",
      "en": "Cryptographic Operations"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Generate AMEX CSC",
          "en": "Fields and parameters for Generate AMEX CSC"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 35B (Generate AMEX CSC)"
  },
  {
    "id": "atalla-35f-req",
    "code": "35F",
    "direction": "request",
    "pairedCode": "45F",
    "name": {
      "es": "Verify Discover DCVV (Petición)",
      "en": "Verify Discover DCVV (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 35F: Verify Discover DCVV",
      "en": "Atalla AT1000 Command 35F: Verify Discover DCVV"
    },
    "description": {
      "es": "Ejecuta la operación de Verify Discover DCVV en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Verify Discover DCVV operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Operaciones Criptográficas",
      "en": "Cryptographic Operations"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Verify Discover DCVV",
          "en": "Fields and parameters for Verify Discover DCVV"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 35F (Verify Discover DCVV)"
  },
  {
    "id": "atalla-36-req",
    "code": "36",
    "direction": "request",
    "pairedCode": "46",
    "name": {
      "es": "Verify Double-Encrypted PIN (Petición)",
      "en": "Verify Double-Encrypted PIN (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 36: Verify Double-Encrypted PIN",
      "en": "Atalla AT1000 Command 36: Verify Double-Encrypted PIN"
    },
    "description": {
      "es": "Ejecuta la operación de Verify Double-Encrypted PIN en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Verify Double-Encrypted PIN operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Procesamiento de PIN",
      "en": "PIN Processing"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Verify Double-Encrypted PIN",
          "en": "Fields and parameters for Verify Double-Encrypted PIN"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 36 (Verify Double-Encrypted PIN)"
  },
  {
    "id": "atalla-365-req",
    "code": "365",
    "direction": "request",
    "pairedCode": "465",
    "name": {
      "es": "Verify Visa Cloud-Based Payments (Petición)",
      "en": "Verify Visa Cloud-Based Payments (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 365: Verify Visa Cloud-Based Payments",
      "en": "Atalla AT1000 Command 365: Verify Visa Cloud-Based Payments"
    },
    "description": {
      "es": "Ejecuta la operación de Verify Visa Cloud-Based Payments en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Verify Visa Cloud-Based Payments operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Tarjetas y EMV",
      "en": "Cards & EMV"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Verify Visa Cloud-Based Payments",
          "en": "Fields and parameters for Verify Visa Cloud-Based Payments"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 365 (Verify Visa Cloud-Based Payments)"
  },
  {
    "id": "atalla-368-req",
    "code": "368",
    "direction": "request",
    "pairedCode": "468",
    "name": {
      "es": "Create Visa Limited Use Key (LUK) (Petición)",
      "en": "Create Visa Limited Use Key (LUK) (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 368: Create Visa Limited Use Key (LUK)",
      "en": "Atalla AT1000 Command 368: Create Visa Limited Use Key (LUK)"
    },
    "description": {
      "es": "Ejecuta la operación de Create Visa Limited Use Key (LUK) en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Create Visa Limited Use Key (LUK) operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Gestión de Claves",
      "en": "Key Management"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Create Visa Limited Use Key (LUK)",
          "en": "Fields and parameters for Create Visa Limited Use Key (LUK)"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 368 (Create Visa Limited Use Key (LUK))"
  },
  {
    "id": "atalla-36a-req",
    "code": "36A",
    "direction": "request",
    "pairedCode": "46A",
    "name": {
      "es": "Verify AMEX Expresspay value - Magstripe Mode (Petición)",
      "en": "Verify AMEX Expresspay value - Magstripe Mode (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 36A: Verify AMEX Expresspay value - Magstripe Mode",
      "en": "Atalla AT1000 Command 36A: Verify AMEX Expresspay value - Magstripe Mode"
    },
    "description": {
      "es": "Ejecuta la operación de Verify AMEX Expresspay value - Magstripe Mode en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Verify AMEX Expresspay value - Magstripe Mode operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Operaciones Criptográficas",
      "en": "Cryptographic Operations"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Verify AMEX Expresspay value - Magstripe Mode",
          "en": "Fields and parameters for Verify AMEX Expresspay value - Magstripe Mode"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 36A (Verify AMEX Expresspay value - Magstripe Mode)"
  },
  {
    "id": "atalla-37-req",
    "code": "37",
    "direction": "request",
    "pairedCode": "47",
    "name": {
      "es": "PIN Change, Atalla DES Bilevel (Petición)",
      "en": "PIN Change, Atalla DES Bilevel (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 37: PIN Change, Atalla DES Bilevel",
      "en": "Atalla AT1000 Command 37: PIN Change, Atalla DES Bilevel"
    },
    "description": {
      "es": "Ejecuta la operación de PIN Change, Atalla DES Bilevel en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes PIN Change, Atalla DES Bilevel operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Procesamiento de PIN",
      "en": "PIN Processing"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para PIN Change, Atalla DES Bilevel",
          "en": "Fields and parameters for PIN Change, Atalla DES Bilevel"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 37 (PIN Change, Atalla DES Bilevel)"
  },
  {
    "id": "atalla-37b-req",
    "code": "37B",
    "direction": "request",
    "pairedCode": "47B",
    "name": {
      "es": "Generate ePIN Offset (Petición)",
      "en": "Generate ePIN Offset (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 37B: Generate ePIN Offset",
      "en": "Atalla AT1000 Command 37B: Generate ePIN Offset"
    },
    "description": {
      "es": "Ejecuta la operación de Generate ePIN Offset en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Generate ePIN Offset operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Procesamiento de PIN",
      "en": "PIN Processing"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Generate ePIN Offset",
          "en": "Fields and parameters for Generate ePIN Offset"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 37B (Generate ePIN Offset)"
  },
  {
    "id": "atalla-386-req",
    "code": "386",
    "direction": "request",
    "pairedCode": "486",
    "name": {
      "es": "Generate DUKPT MAC (Petición)",
      "en": "Generate DUKPT MAC (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 386: Generate DUKPT MAC",
      "en": "Atalla AT1000 Command 386: Generate DUKPT MAC"
    },
    "description": {
      "es": "Ejecuta la operación de Generate DUKPT MAC en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Generate DUKPT MAC operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Procesamiento de PIN",
      "en": "PIN Processing"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Generate DUKPT MAC",
          "en": "Fields and parameters for Generate DUKPT MAC"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 386 (Generate DUKPT MAC)"
  },
  {
    "id": "atalla-388-req",
    "code": "388",
    "direction": "request",
    "pairedCode": "488",
    "name": {
      "es": "3DES DUKPT Encrypt/Decrypt Data (Petición)",
      "en": "3DES DUKPT Encrypt/Decrypt Data (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 388: 3DES DUKPT Encrypt/Decrypt Data",
      "en": "Atalla AT1000 Command 388: 3DES DUKPT Encrypt/Decrypt Data"
    },
    "description": {
      "es": "Ejecuta la operación de 3DES DUKPT Encrypt/Decrypt Data en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes 3DES DUKPT Encrypt/Decrypt Data operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Procesamiento de PIN",
      "en": "PIN Processing"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para 3DES DUKPT Encrypt/Decrypt Data",
          "en": "Fields and parameters for 3DES DUKPT Encrypt/Decrypt Data"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 388 (3DES DUKPT Encrypt/Decrypt Data)"
  },
  {
    "id": "atalla-38c-req",
    "code": "38C",
    "direction": "request",
    "pairedCode": "48C",
    "name": {
      "es": "Derive DUKPT Initial PIN Encryption Key (Petición)",
      "en": "Derive DUKPT Initial PIN Encryption Key (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 38C: Derive DUKPT Initial PIN Encryption Key",
      "en": "Atalla AT1000 Command 38C: Derive DUKPT Initial PIN Encryption Key"
    },
    "description": {
      "es": "Ejecuta la operación de Derive DUKPT Initial PIN Encryption Key en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Derive DUKPT Initial PIN Encryption Key operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Procesamiento de PIN",
      "en": "PIN Processing"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Derive DUKPT Initial PIN Encryption Key",
          "en": "Fields and parameters for Derive DUKPT Initial PIN Encryption Key"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 38C (Derive DUKPT Initial PIN Encryption Key)"
  },
  {
    "id": "atalla-38e-req",
    "code": "38E",
    "direction": "request",
    "pairedCode": "48E",
    "name": {
      "es": "Derive Working Key Using AES DUKPT (Petición)",
      "en": "Derive Working Key Using AES DUKPT (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 38E: Derive Working Key Using AES DUKPT",
      "en": "Atalla AT1000 Command 38E: Derive Working Key Using AES DUKPT"
    },
    "description": {
      "es": "Ejecuta la operación de Derive Working Key Using AES DUKPT en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Derive Working Key Using AES DUKPT operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Procesamiento de PIN",
      "en": "PIN Processing"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Derive Working Key Using AES DUKPT",
          "en": "Fields and parameters for Derive Working Key Using AES DUKPT"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 38E (Derive Working Key Using AES DUKPT)"
  },
  {
    "id": "atalla-39-req",
    "code": "39",
    "direction": "request",
    "pairedCode": "49",
    "name": {
      "es": "Translate PIN and Generate MAC (Petición)",
      "en": "Translate PIN and Generate MAC (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 39: Translate PIN and Generate MAC",
      "en": "Atalla AT1000 Command 39: Translate PIN and Generate MAC"
    },
    "description": {
      "es": "Ejecuta la operación de Translate PIN and Generate MAC en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Translate PIN and Generate MAC operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Procesamiento de PIN",
      "en": "PIN Processing"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Translate PIN and Generate MAC",
          "en": "Fields and parameters for Translate PIN and Generate MAC"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 39 (Translate PIN and Generate MAC)"
  },
  {
    "id": "atalla-390-req",
    "code": "390",
    "direction": "request",
    "pairedCode": "490",
    "name": {
      "es": "Encrypt/Decrypt Data using AES (Petición)",
      "en": "Encrypt/Decrypt Data using AES (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 390: Encrypt/Decrypt Data using AES",
      "en": "Atalla AT1000 Command 390: Encrypt/Decrypt Data using AES"
    },
    "description": {
      "es": "Ejecuta la operación de Encrypt/Decrypt Data using AES en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Encrypt/Decrypt Data using AES operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Operaciones Criptográficas",
      "en": "Cryptographic Operations"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Encrypt/Decrypt Data using AES",
          "en": "Fields and parameters for Encrypt/Decrypt Data using AES"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 390 (Encrypt/Decrypt Data using AES)"
  },
  {
    "id": "atalla-392-req",
    "code": "392",
    "direction": "request",
    "pairedCode": "492",
    "name": {
      "es": "Generate Check Digits for an AES Key (Petición)",
      "en": "Generate Check Digits for an AES Key (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 392: Generate Check Digits for an AES Key",
      "en": "Atalla AT1000 Command 392: Generate Check Digits for an AES Key"
    },
    "description": {
      "es": "Ejecuta la operación de Generate Check Digits for an AES Key en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Generate Check Digits for an AES Key operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Gestión de Claves",
      "en": "Key Management"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Generate Check Digits for an AES Key",
          "en": "Fields and parameters for Generate Check Digits for an AES Key"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 392 (Generate Check Digits for an AES Key)"
  },
  {
    "id": "atalla-393-req",
    "code": "393",
    "direction": "request",
    "pairedCode": "493",
    "name": {
      "es": "Generate Non-Standard Check Values (Petición)",
      "en": "Generate Non-Standard Check Values (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 393: Generate Non-Standard Check Values",
      "en": "Atalla AT1000 Command 393: Generate Non-Standard Check Values"
    },
    "description": {
      "es": "Ejecuta la operación de Generate Non-Standard Check Values en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Generate Non-Standard Check Values operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Operaciones Criptográficas",
      "en": "Cryptographic Operations"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Generate Non-Standard Check Values",
          "en": "Fields and parameters for Generate Non-Standard Check Values"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 393 (Generate Non-Standard Check Values)"
  },
  {
    "id": "atalla-39a-req",
    "code": "39A",
    "direction": "request",
    "pairedCode": "49A",
    "name": {
      "es": "Generate AES or HMAC Working Key (Petición)",
      "en": "Generate AES or HMAC Working Key (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 39A: Generate AES or HMAC Working Key",
      "en": "Atalla AT1000 Command 39A: Generate AES or HMAC Working Key"
    },
    "description": {
      "es": "Ejecuta la operación de Generate AES or HMAC Working Key en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Generate AES or HMAC Working Key operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Gestión de Claves",
      "en": "Key Management"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Generate AES or HMAC Working Key",
          "en": "Fields and parameters for Generate AES or HMAC Working Key"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "notes": [
      {
        "es": "[NOTE] NOTE: To increase security, AES and HMAC keys should be generated encrypted under the AES MFK.",
        "en": "[NOTE] NOTE: To increase security, AES and HMAC keys should be generated encrypted under the AES MFK."
      },
      {
        "es": "[NOTE] Atalla recommends that header byte0 in field 2 contain the number 3.",
        "en": "[NOTE] Atalla recommends that header byte0 in field 2 contain the number 3."
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 39A (Generate AES or HMAC Working Key)"
  },
  {
    "id": "atalla-39b-req",
    "code": "39B",
    "direction": "request",
    "pairedCode": "49B",
    "name": {
      "es": "Generate MAC using HMAC (Petición)",
      "en": "Generate MAC using HMAC (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 39B: Generate MAC using HMAC",
      "en": "Atalla AT1000 Command 39B: Generate MAC using HMAC"
    },
    "description": {
      "es": "Ejecuta la operación de Generate MAC using HMAC en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Generate MAC using HMAC operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Autenticación y MAC",
      "en": "Authentication & MAC"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Generate MAC using HMAC",
          "en": "Fields and parameters for Generate MAC using HMAC"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 39B (Generate MAC using HMAC)"
  },
  {
    "id": "atalla-39c-req",
    "code": "39C",
    "direction": "request",
    "pairedCode": "49C",
    "name": {
      "es": "Verify MAC using HMAC (Petición)",
      "en": "Verify MAC using HMAC (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 39C: Verify MAC using HMAC",
      "en": "Atalla AT1000 Command 39C: Verify MAC using HMAC"
    },
    "description": {
      "es": "Ejecuta la operación de Verify MAC using HMAC en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Verify MAC using HMAC operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Autenticación y MAC",
      "en": "Authentication & MAC"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Verify MAC using HMAC",
          "en": "Fields and parameters for Verify MAC using HMAC"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 39C (Verify MAC using HMAC)"
  },
  {
    "id": "atalla-3a-req",
    "code": "3A",
    "direction": "request",
    "pairedCode": "4A",
    "name": {
      "es": "Verify Card and PIN, Atalla Bilevel (Petición)",
      "en": "Verify Card and PIN, Atalla Bilevel (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 3A: Verify Card and PIN, Atalla Bilevel",
      "en": "Atalla AT1000 Command 3A: Verify Card and PIN, Atalla Bilevel"
    },
    "description": {
      "es": "Ejecuta la operación de Verify Card and PIN, Atalla Bilevel en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Verify Card and PIN, Atalla Bilevel operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Procesamiento de PIN",
      "en": "PIN Processing"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Verify Card and PIN, Atalla Bilevel",
          "en": "Fields and parameters for Verify Card and PIN, Atalla Bilevel"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 3A (Verify Card and PIN, Atalla Bilevel)"
  },
  {
    "id": "atalla-3d-req",
    "code": "3D",
    "direction": "request",
    "pairedCode": "4D",
    "name": {
      "es": "Generate PVN and IBM Offset (Petición)",
      "en": "Generate PVN and IBM Offset (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 3D: Generate PVN and IBM Offset",
      "en": "Atalla AT1000 Command 3D: Generate PVN and IBM Offset"
    },
    "description": {
      "es": "Ejecuta la operación de Generate PVN and IBM Offset en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Generate PVN and IBM Offset operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Operaciones Criptográficas",
      "en": "Cryptographic Operations"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Generate PVN and IBM Offset",
          "en": "Fields and parameters for Generate PVN and IBM Offset"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 3D (Generate PVN and IBM Offset)"
  },
  {
    "id": "atalla-3e-req",
    "code": "3E",
    "direction": "request",
    "pairedCode": "4E",
    "name": {
      "es": "Translate PIN, ISO PIN Blocks (Petición)",
      "en": "Translate PIN, ISO PIN Blocks (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 3E: Translate PIN, ISO PIN Blocks",
      "en": "Atalla AT1000 Command 3E: Translate PIN, ISO PIN Blocks"
    },
    "description": {
      "es": "Ejecuta la operación de Translate PIN, ISO PIN Blocks en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Translate PIN, ISO PIN Blocks operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Procesamiento de PIN",
      "en": "PIN Processing"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Translate PIN, ISO PIN Blocks",
          "en": "Fields and parameters for Translate PIN, ISO PIN Blocks"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 3E (Translate PIN, ISO PIN Blocks)"
  },
  {
    "id": "atalla-3fc-req",
    "code": "3FC",
    "direction": "request",
    "pairedCode": "4FC",
    "name": {
      "es": "EMV PIN change from IBM 3624 offset (Petición)",
      "en": "EMV PIN change from IBM 3624 offset (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 3FC: EMV PIN change from IBM 3624 offset",
      "en": "Atalla AT1000 Command 3FC: EMV PIN change from IBM 3624 offset"
    },
    "description": {
      "es": "Ejecuta la operación de EMV PIN change from IBM 3624 offset en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes EMV PIN change from IBM 3624 offset operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Procesamiento de PIN",
      "en": "PIN Processing"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para EMV PIN change from IBM 3624 offset",
          "en": "Fields and parameters for EMV PIN change from IBM 3624 offset"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 3FC (EMV PIN change from IBM 3624 offset)"
  },
  {
    "id": "atalla-3fd-req",
    "code": "3FD",
    "direction": "request",
    "pairedCode": "4FD",
    "name": {
      "es": "Authenticate multiple EMV scripts (Petición)",
      "en": "Authenticate multiple EMV scripts (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 3FD: Authenticate multiple EMV scripts",
      "en": "Atalla AT1000 Command 3FD: Authenticate multiple EMV scripts"
    },
    "description": {
      "es": "Ejecuta la operación de Authenticate multiple EMV scripts en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Authenticate multiple EMV scripts operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Autenticación y MAC",
      "en": "Authentication & MAC"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Authenticate multiple EMV scripts",
          "en": "Fields and parameters for Authenticate multiple EMV scripts"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 3FD (Authenticate multiple EMV scripts)"
  },
  {
    "id": "atalla-3fe-req",
    "code": "3FE",
    "direction": "request",
    "pairedCode": "4FE",
    "name": {
      "es": "Verify ICC Dynamic Number or Data Authentication Code (Petición)",
      "en": "Verify ICC Dynamic Number or Data Authentication Code (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 3FE: Verify ICC Dynamic Number or Data Authentication Code",
      "en": "Atalla AT1000 Command 3FE: Verify ICC Dynamic Number or Data Authentication Code"
    },
    "description": {
      "es": "Ejecuta la operación de Verify ICC Dynamic Number or Data Authentication Code en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Verify ICC Dynamic Number or Data Authentication Code operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Tarjetas y EMV",
      "en": "Cards & EMV"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Verify ICC Dynamic Number or Data Authentication Code",
          "en": "Fields and parameters for Verify ICC Dynamic Number or Data Authentication Code"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 3FE (Verify ICC Dynamic Number or Data Authentication Code)"
  },
  {
    "id": "atalla-55-req",
    "code": "55",
    "direction": "request",
    "pairedCode": "65",
    "name": {
      "es": "Encrypt, Decrypt Or Translate Data (Petición)",
      "en": "Encrypt, Decrypt Or Translate Data (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 55: Encrypt, Decrypt Or Translate Data",
      "en": "Atalla AT1000 Command 55: Encrypt, Decrypt Or Translate Data"
    },
    "description": {
      "es": "Ejecuta la operación de Encrypt, Decrypt Or Translate Data en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Encrypt, Decrypt Or Translate Data operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Operaciones Criptográficas",
      "en": "Cryptographic Operations"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Encrypt, Decrypt Or Translate Data",
          "en": "Fields and parameters for Encrypt, Decrypt Or Translate Data"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 55 (Encrypt, Decrypt Or Translate Data)"
  },
  {
    "id": "atalla-58-req",
    "code": "58",
    "direction": "request",
    "pairedCode": "68",
    "name": {
      "es": "MAC Translate (Petición)",
      "en": "MAC Translate (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 58: MAC Translate",
      "en": "Atalla AT1000 Command 58: MAC Translate"
    },
    "description": {
      "es": "Ejecuta la operación de MAC Translate en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes MAC Translate operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Autenticación y MAC",
      "en": "Authentication & MAC"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para MAC Translate",
          "en": "Fields and parameters for MAC Translate"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 58 (MAC Translate)"
  },
  {
    "id": "atalla-59-req",
    "code": "59",
    "direction": "request",
    "pairedCode": "69",
    "name": {
      "es": "Generate MAC and Encrypt or Translate Data (Petición)",
      "en": "Generate MAC and Encrypt or Translate Data (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 59: Generate MAC and Encrypt or Translate Data",
      "en": "Atalla AT1000 Command 59: Generate MAC and Encrypt or Translate Data"
    },
    "description": {
      "es": "Ejecuta la operación de Generate MAC and Encrypt or Translate Data en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Generate MAC and Encrypt or Translate Data operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Autenticación y MAC",
      "en": "Authentication & MAC"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Generate MAC and Encrypt or Translate Data",
          "en": "Fields and parameters for Generate MAC and Encrypt or Translate Data"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 59 (Generate MAC and Encrypt or Translate Data)"
  },
  {
    "id": "atalla-5c-req",
    "code": "5C",
    "direction": "request",
    "pairedCode": "6C",
    "name": {
      "es": "Verify and Generate MAC, DUKPT (Petición)",
      "en": "Verify and Generate MAC, DUKPT (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 5C: Verify and Generate MAC, DUKPT",
      "en": "Atalla AT1000 Command 5C: Verify and Generate MAC, DUKPT"
    },
    "description": {
      "es": "Ejecuta la operación de Verify and Generate MAC, DUKPT en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Verify and Generate MAC, DUKPT operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Procesamiento de PIN",
      "en": "PIN Processing"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Verify and Generate MAC, DUKPT",
          "en": "Fields and parameters for Verify and Generate MAC, DUKPT"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 5C (Verify and Generate MAC, DUKPT)"
  },
  {
    "id": "atalla-5d-req",
    "code": "5D",
    "direction": "request",
    "pairedCode": "6D",
    "name": {
      "es": "Generate CVV/CVC (Petición)",
      "en": "Generate CVV/CVC (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 5D: Generate CVV/CVC",
      "en": "Atalla AT1000 Command 5D: Generate CVV/CVC"
    },
    "description": {
      "es": "Ejecuta la operación de Generate CVV/CVC en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Generate CVV/CVC operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Operaciones Criptográficas",
      "en": "Cryptographic Operations"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Generate CVV/CVC",
          "en": "Fields and parameters for Generate CVV/CVC"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 5D (Generate CVV/CVC)"
  },
  {
    "id": "atalla-5e-req",
    "code": "5E",
    "direction": "request",
    "pairedCode": "6E",
    "name": {
      "es": "Verify CVV/CVC (Petición)",
      "en": "Verify CVV/CVC (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 5E: Verify CVV/CVC",
      "en": "Atalla AT1000 Command 5E: Verify CVV/CVC"
    },
    "description": {
      "es": "Ejecuta la operación de Verify CVV/CVC en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Verify CVV/CVC operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Operaciones Criptográficas",
      "en": "Cryptographic Operations"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Verify CVV/CVC",
          "en": "Fields and parameters for Verify CVV/CVC"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 5E (Verify CVV/CVC)"
  },
  {
    "id": "atalla-5f-req",
    "code": "5F",
    "direction": "request",
    "pairedCode": "6F",
    "name": {
      "es": "Verify MAC and Decrypt PIN (Petición)",
      "en": "Verify MAC and Decrypt PIN (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 5F: Verify MAC and Decrypt PIN",
      "en": "Atalla AT1000 Command 5F: Verify MAC and Decrypt PIN"
    },
    "description": {
      "es": "Ejecuta la operación de Verify MAC and Decrypt PIN en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Verify MAC and Decrypt PIN operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Procesamiento de PIN",
      "en": "PIN Processing"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Verify MAC and Decrypt PIN",
          "en": "Fields and parameters for Verify MAC and Decrypt PIN"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "notes": [
      {
        "es": "[CAUTION] CAUTION: This command processes a clear PIN, it creates a significant security exposure.",
        "en": "[CAUTION] CAUTION: This command processes a clear PIN, it creates a significant security exposure."
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 5F (Verify MAC and Decrypt PIN)"
  },
  {
    "id": "atalla-70-req",
    "code": "70",
    "direction": "request",
    "pairedCode": "80",
    "name": {
      "es": "Load Volatile Table Value (Petición)",
      "en": "Load Volatile Table Value (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 70: Load Volatile Table Value",
      "en": "Atalla AT1000 Command 70: Load Volatile Table Value"
    },
    "description": {
      "es": "Ejecuta la operación de Load Volatile Table Value en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Load Volatile Table Value operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Operaciones Criptográficas",
      "en": "Cryptographic Operations"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Load Volatile Table Value",
          "en": "Fields and parameters for Load Volatile Table Value"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 70 (Load Volatile Table Value)"
  },
  {
    "id": "atalla-71-req",
    "code": "71",
    "direction": "request",
    "pairedCode": "81",
    "name": {
      "es": "Delete Volatile Table Value (Petición)",
      "en": "Delete Volatile Table Value (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 71: Delete Volatile Table Value",
      "en": "Atalla AT1000 Command 71: Delete Volatile Table Value"
    },
    "description": {
      "es": "Ejecuta la operación de Delete Volatile Table Value en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Delete Volatile Table Value operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Operaciones Criptográficas",
      "en": "Cryptographic Operations"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Delete Volatile Table Value",
          "en": "Fields and parameters for Delete Volatile Table Value"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 71 (Delete Volatile Table Value)"
  },
  {
    "id": "atalla-72-req",
    "code": "72",
    "direction": "request",
    "pairedCode": "82",
    "name": {
      "es": "Verify Volatile Table Value (Petición)",
      "en": "Verify Volatile Table Value (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 72: Verify Volatile Table Value",
      "en": "Atalla AT1000 Command 72: Verify Volatile Table Value"
    },
    "description": {
      "es": "Ejecuta la operación de Verify Volatile Table Value en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Verify Volatile Table Value operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Operaciones Criptográficas",
      "en": "Cryptographic Operations"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Verify Volatile Table Value",
          "en": "Fields and parameters for Verify Volatile Table Value"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 72 (Verify Volatile Table Value)"
  },
  {
    "id": "atalla-73-req",
    "code": "73",
    "direction": "request",
    "pairedCode": "83",
    "name": {
      "es": "Clear Section of Volatile Table (Petición)",
      "en": "Clear Section of Volatile Table (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 73: Clear Section of Volatile Table",
      "en": "Atalla AT1000 Command 73: Clear Section of Volatile Table"
    },
    "description": {
      "es": "Ejecuta la operación de Clear Section of Volatile Table en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Clear Section of Volatile Table operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Operaciones Criptográficas",
      "en": "Cryptographic Operations"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Clear Section of Volatile Table",
          "en": "Fields and parameters for Clear Section of Volatile Table"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "notes": [
      {
        "es": "[CAUTION] CAUTION: Before sending this command, make sure no other host application is using the volatile table.",
        "en": "[CAUTION] CAUTION: Before sending this command, make sure no other host application is using the volatile table."
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 73 (Clear Section of Volatile Table)"
  },
  {
    "id": "atalla-74-req",
    "code": "74",
    "direction": "request",
    "pairedCode": "84",
    "name": {
      "es": "Load Diebold Number Table (Petición)",
      "en": "Load Diebold Number Table (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 74: Load Diebold Number Table",
      "en": "Atalla AT1000 Command 74: Load Diebold Number Table"
    },
    "description": {
      "es": "Ejecuta la operación de Load Diebold Number Table en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Load Diebold Number Table operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Operaciones Criptográficas",
      "en": "Cryptographic Operations"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Load Diebold Number Table",
          "en": "Fields and parameters for Load Diebold Number Table"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 74 (Load Diebold Number Table)"
  },
  {
    "id": "atalla-7c-req",
    "code": "7C",
    "direction": "request",
    "pairedCode": "8C",
    "name": {
      "es": "Symmetric Key Size (Petición)",
      "en": "Symmetric Key Size (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 7C: Symmetric Key Size",
      "en": "Atalla AT1000 Command 7C: Symmetric Key Size"
    },
    "description": {
      "es": "Ejecuta la operación de Symmetric Key Size en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Symmetric Key Size operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Gestión de Claves",
      "en": "Key Management"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Symmetric Key Size",
          "en": "Fields and parameters for Symmetric Key Size"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "notes": [
      {
        "es": "[CAUTION] CAUTION:",
        "en": "[CAUTION] CAUTION:"
      },
      {
        "es": "[CAUTION] Enabling this command allows anyone with access to the HSM (such as insiders, malware) to determine the",
        "en": "[CAUTION] Enabling this command allows anyone with access to the HSM (such as insiders, malware) to determine the"
      },
      {
        "es": "[CAUTION] keys that are most vulnerable to cryptanalysis. Users are cautioned that single-DES keys are vulnerable to key",
        "en": "[CAUTION] keys that are most vulnerable to cryptanalysis. Users are cautioned that single-DES keys are vulnerable to key"
      },
      {
        "es": "[CAUTION] search at trivial cost, so allowing an attacker to pinpoint vulnerable keys is a significant risk.",
        "en": "[CAUTION] search at trivial cost, so allowing an attacker to pinpoint vulnerable keys is a significant risk."
      },
      {
        "es": "[CAUTION] Utimaco recommends careful analysis of the security tradeoffs of enabling this command.",
        "en": "[CAUTION] Utimaco recommends careful analysis of the security tradeoffs of enabling this command."
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 7C (Symmetric Key Size)"
  },
  {
    "id": "atalla-7e-req",
    "code": "7E",
    "direction": "request",
    "pairedCode": "8E",
    "name": {
      "es": "Generate Check Digits (Petición)",
      "en": "Generate Check Digits (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 7E: Generate Check Digits",
      "en": "Atalla AT1000 Command 7E: Generate Check Digits"
    },
    "description": {
      "es": "Ejecuta la operación de Generate Check Digits en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Generate Check Digits operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Operaciones Criptográficas",
      "en": "Cryptographic Operations"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Generate Check Digits",
          "en": "Fields and parameters for Generate Check Digits"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "notes": [
      {
        "es": "[NOTE] NOTE: Method 'V' is the standard for 3DES keys and is used by almost all modern banking implementations.",
        "en": "[NOTE] NOTE: Method 'V' is the standard for 3DES keys and is used by almost all modern banking implementations."
      },
      {
        "es": "[NOTE] Other methods are maintained for compatibility with older systems.",
        "en": "[NOTE] Other methods are maintained for compatibility with older systems."
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 7E (Generate Check Digits)"
  },
  {
    "id": "atalla-7f-req",
    "code": "7F",
    "direction": "request",
    "pairedCode": "8F",
    "name": {
      "es": "Load Value to a Specific Volatile Table Location (Petición)",
      "en": "Load Value to a Specific Volatile Table Location (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 7F: Load Value to a Specific Volatile Table Location",
      "en": "Atalla AT1000 Command 7F: Load Value to a Specific Volatile Table Location"
    },
    "description": {
      "es": "Ejecuta la operación de Load Value to a Specific Volatile Table Location en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Load Value to a Specific Volatile Table Location operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Operaciones Criptográficas",
      "en": "Cryptographic Operations"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Load Value to a Specific Volatile Table Location",
          "en": "Fields and parameters for Load Value to a Specific Volatile Table Location"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 7F (Load Value to a Specific Volatile Table Location)"
  },
  {
    "id": "atalla-90-req",
    "code": "90",
    "direction": "request",
    "pairedCode": "A0",
    "name": {
      "es": "Decrypt PIN (Petición)",
      "en": "Decrypt PIN (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 90: Decrypt PIN",
      "en": "Atalla AT1000 Command 90: Decrypt PIN"
    },
    "description": {
      "es": "Ejecuta la operación de Decrypt PIN en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Decrypt PIN operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Procesamiento de PIN",
      "en": "PIN Processing"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Decrypt PIN",
          "en": "Fields and parameters for Decrypt PIN"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "notes": [
      {
        "es": "[CAUTION] CAUTION: This command processes a clear PIN, it creates a significant security exposure.",
        "en": "[CAUTION] CAUTION: This command processes a clear PIN, it creates a significant security exposure."
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 90 (Decrypt PIN)"
  },
  {
    "id": "atalla-93-req",
    "code": "93",
    "direction": "request",
    "pairedCode": "A3",
    "name": {
      "es": "Generate Random Number (Petición)",
      "en": "Generate Random Number (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 93: Generate Random Number",
      "en": "Atalla AT1000 Command 93: Generate Random Number"
    },
    "description": {
      "es": "Ejecuta la operación de Generate Random Number en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Generate Random Number operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Operaciones Criptográficas",
      "en": "Cryptographic Operations"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Generate Random Number",
          "en": "Fields and parameters for Generate Random Number"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 93 (Generate Random Number)"
  },
  {
    "id": "atalla-94-req",
    "code": "94",
    "direction": "request",
    "pairedCode": "A4",
    "name": {
      "es": "Generate Initialization Vector (Petición)",
      "en": "Generate Initialization Vector (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 94: Generate Initialization Vector",
      "en": "Atalla AT1000 Command 94: Generate Initialization Vector"
    },
    "description": {
      "es": "Ejecuta la operación de Generate Initialization Vector en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Generate Initialization Vector operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Operaciones Criptográficas",
      "en": "Cryptographic Operations"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Generate Initialization Vector",
          "en": "Fields and parameters for Generate Initialization Vector"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 94 (Generate Initialization Vector)"
  },
  {
    "id": "atalla-95-req",
    "code": "95",
    "direction": "request",
    "pairedCode": "A5",
    "name": {
      "es": "Reformat Initialization Vector (Petición)",
      "en": "Reformat Initialization Vector (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 95: Reformat Initialization Vector",
      "en": "Atalla AT1000 Command 95: Reformat Initialization Vector"
    },
    "description": {
      "es": "Ejecuta la operación de Reformat Initialization Vector en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Reformat Initialization Vector operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Operaciones Criptográficas",
      "en": "Cryptographic Operations"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Reformat Initialization Vector",
          "en": "Fields and parameters for Reformat Initialization Vector"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 95 (Reformat Initialization Vector)"
  },
  {
    "id": "atalla-96-req",
    "code": "96",
    "direction": "request",
    "pairedCode": "A6",
    "name": {
      "es": "Verify Initialization Vector (Petición)",
      "en": "Verify Initialization Vector (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 96: Verify Initialization Vector",
      "en": "Atalla AT1000 Command 96: Verify Initialization Vector"
    },
    "description": {
      "es": "Ejecuta la operación de Verify Initialization Vector en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Verify Initialization Vector operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Operaciones Criptográficas",
      "en": "Cryptographic Operations"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Verify Initialization Vector",
          "en": "Fields and parameters for Verify Initialization Vector"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 96 (Verify Initialization Vector)"
  },
  {
    "id": "atalla-97-req",
    "code": "97",
    "direction": "request",
    "pairedCode": "A7",
    "name": {
      "es": "Encrypt/Decrypt Data (Petición)",
      "en": "Encrypt/Decrypt Data (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 97: Encrypt/Decrypt Data",
      "en": "Atalla AT1000 Command 97: Encrypt/Decrypt Data"
    },
    "description": {
      "es": "Ejecuta la operación de Encrypt/Decrypt Data en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Encrypt/Decrypt Data operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Operaciones Criptográficas",
      "en": "Cryptographic Operations"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Encrypt/Decrypt Data",
          "en": "Fields and parameters for Encrypt/Decrypt Data"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 97 (Encrypt/Decrypt Data)"
  },
  {
    "id": "atalla-98-req",
    "code": "98",
    "direction": "request",
    "pairedCode": "A8",
    "name": {
      "es": "Generate MAC (Petición)",
      "en": "Generate MAC (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 98: Generate MAC",
      "en": "Atalla AT1000 Command 98: Generate MAC"
    },
    "description": {
      "es": "Ejecuta la operación de Generate MAC en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Generate MAC operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Autenticación y MAC",
      "en": "Authentication & MAC"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Generate MAC",
          "en": "Fields and parameters for Generate MAC"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 98 (Generate MAC)"
  },
  {
    "id": "atalla-99-req",
    "code": "99",
    "direction": "request",
    "pairedCode": "A9",
    "name": {
      "es": "Verify MAC (Petición)",
      "en": "Verify MAC (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 99: Verify MAC",
      "en": "Atalla AT1000 Command 99: Verify MAC"
    },
    "description": {
      "es": "Ejecuta la operación de Verify MAC en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Verify MAC operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Autenticación y MAC",
      "en": "Authentication & MAC"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Verify MAC",
          "en": "Fields and parameters for Verify MAC"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 99 (Verify MAC)"
  },
  {
    "id": "atalla-9a-req",
    "code": "9A",
    "direction": "request",
    "pairedCode": "AA",
    "name": {
      "es": "AKB Header Mapping (Petición)",
      "en": "AKB Header Mapping (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 9A: AKB Header Mapping",
      "en": "Atalla AT1000 Command 9A: AKB Header Mapping"
    },
    "description": {
      "es": "Ejecuta la operación de AKB Header Mapping en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes AKB Header Mapping operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Procesamiento de PIN",
      "en": "PIN Processing"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para AKB Header Mapping",
          "en": "Fields and parameters for AKB Header Mapping"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "notes": [
      {
        "es": "[CAUTION] CAUTION: Once the counter value reaches zero, the HSM will return an error <00#0300xx#> instead of",
        "en": "[CAUTION] CAUTION: Once the counter value reaches zero, the HSM will return an error <00#0300xx#> instead of"
      },
      {
        "es": "[CAUTION] processing the counted command.",
        "en": "[CAUTION] processing the counted command."
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 9A (AKB Header Mapping)"
  },
  {
    "id": "atalla-9b-req",
    "code": "9B",
    "direction": "request",
    "pairedCode": "AB",
    "name": {
      "es": "Verify ACR Response MAC (Petición)",
      "en": "Verify ACR Response MAC (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 9B: Verify ACR Response MAC",
      "en": "Atalla AT1000 Command 9B: Verify ACR Response MAC"
    },
    "description": {
      "es": "Ejecuta la operación de Verify ACR Response MAC en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Verify ACR Response MAC operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Autenticación y MAC",
      "en": "Authentication & MAC"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Verify ACR Response MAC",
          "en": "Fields and parameters for Verify ACR Response MAC"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 9B (Verify ACR Response MAC)"
  },
  {
    "id": "atalla-9d-req",
    "code": "9D",
    "direction": "request",
    "pairedCode": "AD",
    "name": {
      "es": "Translate Working Key from 3DES MFK to AES MFK (Petición)",
      "en": "Translate Working Key from 3DES MFK to AES MFK (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 9D: Translate Working Key from 3DES MFK to AES MFK",
      "en": "Atalla AT1000 Command 9D: Translate Working Key from 3DES MFK to AES MFK"
    },
    "description": {
      "es": "Ejecuta la operación de Translate Working Key from 3DES MFK to AES MFK en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Translate Working Key from 3DES MFK to AES MFK operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Gestión de Claves",
      "en": "Key Management"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Translate Working Key from 3DES MFK to AES MFK",
          "en": "Fields and parameters for Translate Working Key from 3DES MFK to AES MFK"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 9D (Translate Working Key from 3DES MFK to AES MFK)"
  },
  {
    "id": "atalla-9e-req",
    "code": "9E",
    "direction": "request",
    "pairedCode": "AE",
    "name": {
      "es": "Translate Working Key from Current MFK to Pending MFK (Petición)",
      "en": "Translate Working Key from Current MFK to Pending MFK (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 9E: Translate Working Key from Current MFK to Pending MFK",
      "en": "Atalla AT1000 Command 9E: Translate Working Key from Current MFK to Pending MFK"
    },
    "description": {
      "es": "Ejecuta la operación de Translate Working Key from Current MFK to Pending MFK en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Translate Working Key from Current MFK to Pending MFK operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Gestión de Claves",
      "en": "Key Management"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Translate Working Key from Current MFK to Pending MFK",
          "en": "Fields and parameters for Translate Working Key from Current MFK to Pending MFK"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 9E (Translate Working Key from Current MFK to Pending MFK)"
  },
  {
    "id": "atalla-9f-req",
    "code": "9F",
    "direction": "request",
    "pairedCode": "AF",
    "name": {
      "es": "Replace the Current MFK with the Pending MFK (Petición)",
      "en": "Replace the Current MFK with the Pending MFK (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 9F: Replace the Current MFK with the Pending MFK",
      "en": "Atalla AT1000 Command 9F: Replace the Current MFK with the Pending MFK"
    },
    "description": {
      "es": "Ejecuta la operación de Replace the Current MFK with the Pending MFK en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Replace the Current MFK with the Pending MFK operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Gestión de Claves",
      "en": "Key Management"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Replace the Current MFK with the Pending MFK",
          "en": "Fields and parameters for Replace the Current MFK with the Pending MFK"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command 9F (Replace the Current MFK with the Pending MFK)"
  },
  {
    "id": "atalla-ba-req",
    "code": "BA",
    "direction": "request",
    "pairedCode": "CA",
    "name": {
      "es": "PIN Translate (ANSI to PIN/Pad) and MAC Verification (Petición)",
      "en": "PIN Translate (ANSI to PIN/Pad) and MAC Verification (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 BA: PIN Translate (ANSI to PIN/Pad) and MAC Verification",
      "en": "Atalla AT1000 Command BA: PIN Translate (ANSI to PIN/Pad) and MAC Verification"
    },
    "description": {
      "es": "Ejecuta la operación de PIN Translate (ANSI to PIN/Pad) and MAC Verification en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes PIN Translate (ANSI to PIN/Pad) and MAC Verification operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Procesamiento de PIN",
      "en": "PIN Processing"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para PIN Translate (ANSI to PIN/Pad) and MAC Verification",
          "en": "Fields and parameters for PIN Translate (ANSI to PIN/Pad) and MAC Verification"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command BA (PIN Translate (ANSI to PIN/Pad) and MAC Verification)"
  },
  {
    "id": "atalla-bb-req",
    "code": "BB",
    "direction": "request",
    "pairedCode": "CB",
    "name": {
      "es": "Translate PIN (ANSI to ANSI) and Verify MAC (Petición)",
      "en": "Translate PIN (ANSI to ANSI) and Verify MAC (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 BB: Translate PIN (ANSI to ANSI) and Verify MAC",
      "en": "Atalla AT1000 Command BB: Translate PIN (ANSI to ANSI) and Verify MAC"
    },
    "description": {
      "es": "Ejecuta la operación de Translate PIN (ANSI to ANSI) and Verify MAC en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Translate PIN (ANSI to ANSI) and Verify MAC operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Procesamiento de PIN",
      "en": "PIN Processing"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Translate PIN (ANSI to ANSI) and Verify MAC",
          "en": "Fields and parameters for Translate PIN (ANSI to ANSI) and Verify MAC"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command BB (Translate PIN (ANSI to ANSI) and Verify MAC)"
  },
  {
    "id": "atalla-bd-req",
    "code": "BD",
    "direction": "request",
    "pairedCode": "CD",
    "name": {
      "es": "Translate PIN and Generate MAC (Petición)",
      "en": "Translate PIN and Generate MAC (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 BD: Translate PIN and Generate MAC",
      "en": "Atalla AT1000 Command BD: Translate PIN and Generate MAC"
    },
    "description": {
      "es": "Ejecuta la operación de Translate PIN and Generate MAC en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Translate PIN and Generate MAC operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Procesamiento de PIN",
      "en": "PIN Processing"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Translate PIN and Generate MAC",
          "en": "Fields and parameters for Translate PIN and Generate MAC"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command BD (Translate PIN and Generate MAC)"
  },
  {
    "id": "atalla-be-req",
    "code": "BE",
    "direction": "request",
    "pairedCode": "CE",
    "name": {
      "es": "Verify Visa Stored Value Card (VSVC) S1 Signature and Generate VSVC S2 Signature (Petición)",
      "en": "Verify Visa Stored Value Card (VSVC) S1 Signature and Generate VSVC S2 Signature (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 BE: Verify Visa Stored Value Card (VSVC) S1 Signature and Generate VSVC S2 Signature",
      "en": "Atalla AT1000 Command BE: Verify Visa Stored Value Card (VSVC) S1 Signature and Generate VSVC S2 Signature"
    },
    "description": {
      "es": "Ejecuta la operación de Verify Visa Stored Value Card (VSVC) S1 Signature and Generate VSVC S2 Signature en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Verify Visa Stored Value Card (VSVC) S1 Signature and Generate VSVC S2 Signature operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Tarjetas y EMV",
      "en": "Cards & EMV"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Verify Visa Stored Value Card (VSVC) S1 Signature and Generate VSVC S2 Signature",
          "en": "Fields and parameters for Verify Visa Stored Value Card (VSVC) S1 Signature and Generate VSVC S2 Signature"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command BE (Verify Visa Stored Value Card (VSVC) S1 Signature and Generate VSVC S2 Signature)"
  },
  {
    "id": "atalla-bf-req",
    "code": "BF",
    "direction": "request",
    "pairedCode": "CF",
    "name": {
      "es": "Verify Visa Stored Value Card (VSVC) S3 Signature (Petición)",
      "en": "Verify Visa Stored Value Card (VSVC) S3 Signature (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 BF: Verify Visa Stored Value Card (VSVC) S3 Signature",
      "en": "Atalla AT1000 Command BF: Verify Visa Stored Value Card (VSVC) S3 Signature"
    },
    "description": {
      "es": "Ejecuta la operación de Verify Visa Stored Value Card (VSVC) S3 Signature en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Verify Visa Stored Value Card (VSVC) S3 Signature operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Tarjetas y EMV",
      "en": "Cards & EMV"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Verify Visa Stored Value Card (VSVC) S3 Signature",
          "en": "Fields and parameters for Verify Visa Stored Value Card (VSVC) S3 Signature"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command BF (Verify Visa Stored Value Card (VSVC) S3 Signature)"
  },
  {
    "id": "atalla-d0-req",
    "code": "D0",
    "direction": "request",
    "pairedCode": "E0",
    "name": {
      "es": "Verify Clear PIN (Petición)",
      "en": "Verify Clear PIN (Request)"
    },
    "summary": {
      "es": "Comando Atalla AT1000 D0: Verify Clear PIN",
      "en": "Atalla AT1000 Command D0: Verify Clear PIN"
    },
    "description": {
      "es": "Ejecuta la operación de Verify Clear PIN en el HSM Atalla AT1000 de acuerdo al manual oficial v8.60.",
      "en": "Executes Verify Clear PIN operation on the Atalla AT1000 HSM according to the official v8.60 manual."
    },
    "category": {
      "es": "Procesamiento de PIN",
      "en": "PIN Processing"
    },
    "fields": [
      {
        "id": "payload",
        "name": {
          "es": "Parámetros del Comando",
          "en": "Command Parameters"
        },
        "description": {
          "es": "Campos y parámetros para Verify Clear PIN",
          "en": "Fields and parameters for Verify Clear PIN"
        },
        "position": 0,
        "length": {
          "kind": "range",
          "min": 0,
          "max": 2048
        },
        "encoding": "ascii",
        "required": false
      }
    ],
    "notes": [
      {
        "es": "[CAUTION] CAUTION: This command processes a clear PIN, it creates a significant security exposure.",
        "en": "[CAUTION] CAUTION: This command processes a clear PIN, it creates a significant security exposure."
      }
    ],
    "source": "Atalla AT1000 HSM Command Reference Manual v8.60, Command D0 (Verify Clear PIN)"
  }
];
